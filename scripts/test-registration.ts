/* Dev Test Script: Registration Flow
 * Run with: (ensure ts-node or build environment) – for local inspection only.
 */
import { testRegister } from '@/lib/auth/register';

async function main() {
    await testRegister([
        {
            firstName: 'dsfad',
            lastName: 'adsfadfa',
            email: 'rowyda15@gmail.com',
            phone: '+971554454159',
            password: '12345678',
            confirmPassword: '12345678'
        }
    ]);
}

main().catch(e => console.error(e));
