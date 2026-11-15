import "@testing-library/jest-dom/vitest";

// Ensure baseline test environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";
process.env.GUEST_TOKEN_SECRET = "12345678901234567890123456789012";
process.env.RESEND_API_KEY = "re_test_dummy";
process.env.EMAIL_FROM = "Laira Charms <no-reply@lairacharms.pk>";

