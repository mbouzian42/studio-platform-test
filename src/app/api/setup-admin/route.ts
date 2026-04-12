import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const email = 'testagent.jetski@gmail.com';

  console.log(`Setting up admin user: ${email}`);

  // 1. Get user id from Auth (since we have service role)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ error: `User ${email} not found` }, { status: 404 });
  }

  // 2. Confirm email
  await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });

  // 3. Update role to admin in profiles
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `User ${email} is now an admin and confirmed`, id: user.id });
}
