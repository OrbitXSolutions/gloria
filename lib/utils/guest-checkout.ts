/**
 * Guest Checkout Utilities
 * =========================
 * Helper functions to handle guest user creation during checkout
 */

import { createSsrClient } from "@/lib/supabase/server";
import { validatePhoneNumber, getE164Format } from "@/lib/utils/phone";
import { BRAND_CONFIG } from "@/lib/config/brand";
import { AUTH_CONFIG, getAuthRedirectUrl } from "@/lib/config/auth";

export interface GuestUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    fullName: string;
    address: string;
    phone: string;
    email: string;
    stateCode?: string;
    notes?: string;
  };
}

export interface GuestUserResult {
  success: boolean;
  userId?: string;
  supabaseUserId?: string;
  error?: string;
  requiresEmailVerification?: boolean;
}

/**
 * Create a guest user account during checkout
 */
export async function createGuestUser(userData: GuestUserData): Promise<GuestUserResult> {
  try {
    const supabase = await createSsrClient();
    const { email, firstName, lastName, phone, address } = userData;

    // Validate phone number if provided
    let formattedPhone: string | undefined;
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: `Invalid phone number: ${phoneValidation.error}`
        };
      }
      formattedPhone = phoneValidation.formatted;
    }

    // Generate a temporary password for the guest user
    const tempPassword = generateSecurePassword();

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          phone: formattedPhone || null,
          isGuestUser: true,
          createdDuringCheckout: true,
        },
        emailRedirectTo: getAuthRedirectUrl('/auth/confirm'),
      },
    });

    if (authError) {
      // Handle case where user already exists
      if (authError.message.includes('User already registered')) {
        // Try to find existing user
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, user_id, email')
          .eq('email', email)
          .single();

        if (existingUser) {
          return {
            success: true,
            userId: existingUser.id.toString(),
            supabaseUserId: existingUser.user_id,
          };
        }
      }

      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }

    // Create user in public.users table
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .insert({
        user_id: authData.user.id,
        email,
        phone: formattedPhone,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (publicUserError) {
      console.error('Error creating public user:', publicUserError);
      return {
        success: false,
        error: 'Failed to create user profile'
      };
    }

    const userId = publicUser?.id?.toString();

    // Create address if provided
    if (address && userId) {
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: parseInt(userId),
          full_name: address.fullName,
          address: address.address,
          phone: address.phone,
          email: address.email,
          state_code: address.stateCode,
          notes: address.notes,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (addressError) {
        console.error('Error creating address:', addressError);
        // Don't fail the whole operation for address creation
      }
    }

    // Log the successful guest user creation
    try {
      await supabase.rpc('add_app_log', {
        p_level: 'info',
        p_message: 'Guest user created during checkout',
        p_user_id: authData.user.id,
        p_category: 'auth',
        p_source: 'guest_checkout',
        p_context: {
          email,
          hasPhone: !!formattedPhone,
          hasAddress: !!address,
        },
        p_stack_trace: null,
      });
    } catch (logError) {
      console.error('Failed to log guest user creation:', logError);
    }

    return {
      success: true,
      userId,
      supabaseUserId: authData.user.id,
      requiresEmailVerification: !authData.session, // No session means email verification required
    };

  } catch (error) {
    console.error('Unexpected error creating guest user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error occurred'
    };
  }
}

/**
 * Convert a guest user to a regular user (when they set a password)
 */
export async function upgradeGuestUser(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSsrClient();

    // Update the user's password and remove guest flags
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        isGuestUser: false,
        upgradeDate: new Date().toISOString(),
      }
    });

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Error upgrading guest user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upgrade account'
    };
  }
}

/**
 * Check if a user exists and is a guest user
 */
export async function isGuestUser(email: string): Promise<{
  exists: boolean;
  isGuest: boolean;
  userId?: string;
}> {
  try {
    const supabase = await createSsrClient();
    
    const { data: user } = await supabase
      .from('users')
      .select('id, user_id')
      .eq('email', email)
      .single();

    if (!user) {
      return { exists: false, isGuest: false };
    }

    // Check if user has guest metadata in auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
    
    const isGuest = authUser.user?.user_metadata?.isGuestUser === true;

    return {
      exists: true,
      isGuest,
      userId: user.id.toString()
    };

  } catch (error) {
    console.error('Error checking guest user status:', error);
    return { exists: false, isGuest: false };
  }
}

/**
 * Generate a secure temporary password for guest users
 */
function generateSecurePassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Resend email verification for guest user
 */
export async function resendGuestUserVerification(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSsrClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl('/auth/confirm')
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Error resending guest user verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend verification'
    };
  }
}