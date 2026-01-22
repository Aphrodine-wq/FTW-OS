-- Enable RLS
alter table auth.users enable row level security;

-- Invoices Table
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoiceNumber text not null,
  clientId text,
  clientEmail text,
  clientAddress jsonb,
  issueDate timestamp with time zone,
  dueDate timestamp with time zone,
  lineItems jsonb default '[]',
  subtotal numeric default 0,
  tax numeric default 0,
  shipping numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  currency text default 'USD',
  status text default 'draft',
  notes text,
  terms text,
  paymentLink text,
  poNumber text,
  shippingAddress jsonb,
  bankDetails jsonb,
  customFields jsonb default '[]',
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now()),
  user_id uuid references auth.users not null
);

-- RLS Policies for Invoices
alter table public.invoices enable row level security;

create policy "Users can view their own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete their own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- Profiles Table (Optional, for business settings)
create table public.profiles (
  id uuid references auth.users primary key,
  email text,
  full_name text,
  avatar_url text,
  business_name text,
  business_address jsonb,
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Handle User Creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

