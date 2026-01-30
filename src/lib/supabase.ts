// Mock Supabase client for local development without Supabase connection
import { User } from '@supabase/supabase-js';

// Mock User type
interface MockUser extends User {
  email?: string;
}

// Storage keys
const STORAGE_KEY_AUTH = 'mock_supabase_auth';
const STORAGE_KEY_CATEGORIES = 'mock_supabase_categories';
const STORAGE_KEY_ITEMS = 'mock_supabase_items';

// Initialize default categories - Finance compliance subcategories
const defaultCategories = [
  { id: '1', name: 'Financial Reporting', description: 'Financial statements, disclosures, and reporting requirements', color: '#dc2626', created_at: new Date().toISOString() },
  { id: '2', name: 'Tax Compliance', description: 'Tax filings, payments, and regulatory tax requirements', color: '#dc2626', created_at: new Date().toISOString() },
  { id: '3', name: 'Audit & Controls', description: 'Internal controls, audit requirements, and risk management', color: '#000000', created_at: new Date().toISOString() },
  { id: '4', name: 'Regulatory Compliance', description: 'Banking regulations, SOX, GAAP, and other financial regulations', color: '#dc2626', created_at: new Date().toISOString() },
  { id: '5', name: 'Budget & Forecasting', description: 'Budget compliance, forecasting accuracy, and variance analysis', color: '#000000', created_at: new Date().toISOString() },
  { id: '6', name: 'Accounts Payable/Receivable', description: 'AP/AR processes, payment terms, and collection compliance', color: '#dc2626', created_at: new Date().toISOString() },
  { id: '7', name: 'Capital Management', description: 'Capital allocation, debt compliance, and liquidity requirements', color: '#000000', created_at: new Date().toISOString() },
];

// Initialize storage
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(STORAGE_KEY_ITEMS)) {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([]));
  }
};

initStorage();

// Mock Supabase client
const createMockSupabaseClient = () => {
  const getAuth = () => {
    const getSession = async () => {
      const authData = localStorage.getItem(STORAGE_KEY_AUTH);
      if (authData) {
        const { user, session } = JSON.parse(authData);
        return { data: { session: session ? { user } : null }, error: null };
      }
      return { data: { session: null }, error: null };
    };

    const signInWithPassword = async ({ email }: { email: string; password: string }) => {
      // Simple mock - accept any email/password
      const user: MockUser = {
        id: 'mock-user-id',
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      };
      const session = { user, access_token: 'mock-token', expires_at: Date.now() + 3600000 };
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user, session }));
      return { data: { user, session }, error: null };
    };

    const signUp = async ({ email, password }: { email: string; password: string }) => {
      return signInWithPassword({ email, password });
    };

    const signOut = async () => {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      return { error: null };
    };

    const onAuthStateChange = (callback: (event: string, session: any) => void) => {
      // Simulate auth state change
      const checkAuth = () => {
        const authData = localStorage.getItem(STORAGE_KEY_AUTH);
        if (authData) {
          const { session } = JSON.parse(authData);
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      };
      
      checkAuth();
      
      // Listen for storage changes (for multi-tab support)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY_AUTH) {
          checkAuth();
        }
      };
      window.addEventListener('storage', handleStorageChange);

      const subscription = {
        id: 'mock-sub',
        unsubscribe: () => {
          window.removeEventListener('storage', handleStorageChange);
        },
      };

      return {
        data: { subscription },
      };
    };

    return {
      getSession,
      signInWithPassword,
      signUp,
      signOut,
      onAuthStateChange,
    };
  };

  const from = (table: string) => {
    const getData = () => {
      const key = table === 'compliance_categories' ? STORAGE_KEY_CATEGORIES : STORAGE_KEY_ITEMS;
      const data = localStorage.getItem(key);
      const parsed = data ? JSON.parse(data) : [];
      // Ensure all items have owner_email field for backward compatibility
      if (table === 'compliance_items') {
        return parsed.map((item: any) => ({
          ...item,
          owner_email: item.owner_email || '',
        }));
      }
      return parsed;
    };

    const saveData = (data: any[]) => {
      const key = table === 'compliance_categories' ? STORAGE_KEY_CATEGORIES : STORAGE_KEY_ITEMS;
      localStorage.setItem(key, JSON.stringify(data));
    };

    const select = (columns: string = '*') => {
      const data = getData();
      
      // Create a promise-like object that supports chaining
      const createQueryResult = (resultData: any[]) => {
        const result = Promise.resolve({ data: resultData, error: null });
        
        return Object.assign(result, {
          order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => {
            const sorted = [...resultData].sort((a, b) => {
              const aVal = a[column];
              const bVal = b[column];
              
              if (aVal === null || aVal === undefined) return options?.nullsFirst ? -1 : 1;
              if (bVal === null || bVal === undefined) return options?.nullsFirst ? 1 : -1;
              
              if (options?.ascending === false) {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              }
              return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            });
            
            return Promise.resolve({ data: sorted, error: null });
          },
          eq: (column: string, value: any) => {
            const filtered = resultData.filter((item: any) => item[column] === value);
            return Promise.resolve({ data: filtered, error: null });
          },
        });
      };
      
      // Handle nested select (e.g., '*, compliance_categories(*)')
      if (columns.includes('compliance_categories')) {
        const categories = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
        const enriched = data.map((item: any) => ({
          ...item,
          compliance_categories: categories.find((cat: any) => cat.id === item.category_id) || null,
        }));
        return createQueryResult(enriched);
      }
      
      return createQueryResult(data);
    };

    const insert = (values: any) => {
      const data = getData();
      const authData = localStorage.getItem(STORAGE_KEY_AUTH);
      const userId = authData ? JSON.parse(authData).user.id : 'mock-user-id';
      
      // Handle both array and single object
      const valuesArray = Array.isArray(values) ? values : [values];
      const newItems = valuesArray.map((value) => ({
        ...value,
        id: crypto.randomUUID(),
        user_id: userId,
        owner_email: value.owner_email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      data.push(...newItems);
      saveData(data);
      return Promise.resolve({ data: newItems, error: null });
    };

    const update = (values: any) => {
      return {
        eq: (column: string, value: any) => {
          const data = getData();
          const index = data.findIndex((item: any) => item[column] === value);
          if (index === -1) {
            return Promise.resolve({ data: [], error: null });
          }
          data[index] = {
            ...data[index],
            ...values,
            updated_at: new Date().toISOString(),
          };
          saveData(data);
          return Promise.resolve({ data: [data[index]], error: null });
        },
      };
    };

    const delete_ = () => {
      return {
        eq: (column: string, value: any) => {
          const data = getData();
          const filtered = data.filter((item: any) => item[column] !== value);
          saveData(filtered);
          return Promise.resolve({ data: [], error: null });
        },
      };
    };

    return {
      select,
      insert,
      update,
      delete: delete_,
    };
  };

  return {
    auth: getAuth(),
    from,
  };
};

export const supabase = createMockSupabaseClient();
