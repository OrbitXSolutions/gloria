# Logging Implementation Guide

This guide shows how to implement the comprehensive logging system in your Gloria Next.js application.

## ✅ What We've Set Up

### 1. Database Tables & Functions (Completed)
- ✅ `api_request_logs` - Server-side API request logging
- ✅ `client_request_logs` - Client-side request logging  
- ✅ `application_logs` - General application logging
- ✅ `performance_logs` - Performance monitoring
- ✅ RPC functions for adding logs with proper parameter ordering

### 2. Frontend Logging Infrastructure (Completed)
- ✅ `Logger` class with comprehensive logging capabilities
- ✅ `APIClient` with automatic request/response logging
- ✅ `LoggerProvider` React context for app-wide logging
- ✅ Custom hooks for common logging scenarios
- ✅ Error boundary with automatic error logging

### 3. Middleware Integration (Completed)
- ✅ Request/response logging middleware
- ✅ Performance tracking
- ✅ User identification and IP tracking

## 🚀 How to Use

### 1. Basic Logging

```typescript
import { useLogger } from '@/components/_core/providers/logger-provider';

function MyComponent() {
  const { logger } = useLogger();

  const handleSubmit = async () => {
    try {
      // Your logic here
      await logger.info('Form submitted successfully', { 
        formName: 'contact', 
        userId: user?.id 
      });
    } catch (error) {
      await logger.error('Form submission failed', { 
        error: error.message,
        formName: 'contact'
      });
    }
  };
}
```

### 2. User Action Tracking

```typescript
import { useUserActions } from '@/hooks/use-logging';

function ProductCard({ product }) {
  const { logProductView, logProductAddToCart, logButtonClick } = useUserActions();

  useEffect(() => {
    // Log product view
    logProductView(product.id, product.name, {
      category: product.category,
      price: product.price,
    });
  }, [product.id]);

  const handleAddToCart = () => {
    logProductAddToCart(product.id, 1, {
      price: product.price,
      category: product.category,
    });
    // Your add to cart logic
  };

  const handleClick = () => {
    logButtonClick('product_details', { productId: product.id });
    // Navigate to product details
  };
}
```

### 3. Performance Monitoring

```typescript
import { usePerformanceTracking } from '@/hooks/use-logging';

function ExpensiveComponent() {
  const { measureAsync, measureSync } = usePerformanceTracking();

  const handleExpensiveOperation = async () => {
    await measureAsync(
      'expensive_api_call',
      async () => {
        const result = await fetch('/api/heavy-computation');
        return result.json();
      },
      { userId: user?.id }
    );
  };

  const processData = (data) => {
    return measureSync(
      'data_processing',
      () => {
        // Your expensive sync operation
        return data.map(item => transformItem(item));
      },
      { itemCount: data.length }
    );
  };
}
```

### 4. Error Tracking

```typescript
import { useErrorTracking } from '@/hooks/use-logging';

function APIConsumer() {
  const { trackAPIError, trackError } = useErrorTracking();

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/products');
      return response.data;
    } catch (error) {
      trackAPIError(error, '/api/products', 'GET');
      throw error;
    }
  };

  const handleFileUpload = async (file) => {
    try {
      // File processing logic
    } catch (error) {
      trackError(error, {
        operation: 'file_upload',
        fileName: file.name,
        fileSize: file.size,
      });
    }
  };
}
```

### 5. Using the Enhanced API Client

```typescript
import { apiClient } from '@/lib/utils/api-client';

// Automatically logs request/response, handles retries, and tracks performance
const response = await apiClient.post('/api/checkout', {
  items: cartItems,
  userId: user.id,
}, {
  timeout: 10000,
  retries: 2,
  logPerformance: true,
});

// Skip logging for sensitive operations
const sensitiveResponse = await apiClient.post('/api/auth/login', 
  credentials, 
  { skipLogging: true }
);
```

## 📊 Log Analysis Queries

### Get API Performance Stats
```sql
SELECT * FROM get_performance_stats('API_POST_checkout', NOW() - INTERVAL '24 hours', NOW());
```

### Get Error Summary
```sql
SELECT * FROM get_app_logs(100, 0, 'error', NULL, NULL, NOW() - INTERVAL '1 day', NOW());
```

### Get User Activity
```sql
SELECT * FROM get_api_logs(50, 0, NULL, NULL, 'user-id-here', NOW() - INTERVAL '7 days', NOW());
```

### Get Log Statistics
```sql
SELECT * FROM get_log_statistics(7);
```

## 🔧 Configuration

### Environment Variables
```env
# Enable/disable logging
NEXT_PUBLIC_ENABLE_LOGGING=true
ENABLE_LOGGING=true

# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Database logging
LOG_TO_DATABASE=true

# Log retention
LOG_RETENTION_DAYS=30

# Performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

## 🛠 Advanced Features

### 1. Custom Log Sanitization
The system automatically redacts sensitive fields like passwords, tokens, etc.

### 2. Performance Budgets
Set up alerts when operations exceed performance thresholds:

```typescript
await measureAsync('checkout_process', checkoutOperation, {
  performanceBudget: 2000, // 2 seconds
  alertOnExceed: true,
});
```

### 3. Sampling for High Traffic
Configure sampling rates to reduce log volume:

```env
LOGGING_SAMPLE_RATE=0.1  # Log 10% of requests
```

### 4. Log Aggregation
Use the built-in statistics functions to analyze trends:

- Request volume patterns
- Error rates by endpoint
- Performance percentiles
- User behavior analytics

## 🚨 Important Notes

1. **Privacy**: Sensitive data is automatically sanitized
2. **Performance**: Logging is asynchronous and won't block your app
3. **Storage**: Set up log rotation to manage database size
4. **Monitoring**: Create dashboards to monitor log health
5. **Security**: Use RLS policies to protect log data access

## 📈 Monitoring Dashboard Ideas

Create views for:
- Real-time error rates
- API response time trends
- User journey analysis
- Performance regression detection
- Feature usage analytics

This logging system provides comprehensive visibility into your application while maintaining performance and security best practices.
