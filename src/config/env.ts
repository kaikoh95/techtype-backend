import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function validateEnv(): EnvConfig {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  // Ensure URL has proper protocol
  const fullUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}.supabase.co`;

  return {
    PORT: Number(process.env.PORT) || 3000,
    SUPABASE_URL: fullUrl,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  };
}

export const env = validateEnv();