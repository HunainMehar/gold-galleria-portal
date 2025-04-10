import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log a warning if using placeholder values (only in development)
if (process.env.NODE_ENV !== 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn(
            'Supabase credentials not found. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
        );
    }
}

// Helper functions for working with expenses
export const expenseApi = {
    // Get all expenses with their categories
    async getAllExpenses() {
        const { data, error } = await supabase
            .from('expenses')
            .select(`*, category:categories(id, name)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get a single expense by ID
    async getExpenseById(id) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`*, category:categories(id, name)`)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create a new expense
    async createExpense(expense) {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Ensure user_id is set
        const expenseData = {
            ...expense,
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('expenses')
            .insert(expenseData)
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(
                error.message ||
                'An unexpected error occurred while saving the expense'
            );
        }
        return data[0];
    },

    // Update an existing expense
    async updateExpense(id, expense) {
        const { data, error } = await supabase
            .from('expenses')
            .update(expense)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    // Delete an expense
    async deleteExpense(id) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// Helper functions for working with categories
export const categoryApi = {
    // Get all categories
    async getAllCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get a single category by ID
    async getCategoryById(id) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create a new category
    async createCategory(category) {
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select();

        if (error) throw error;
        return data[0];
    },

    // Update an existing category
    async updateCategory(id, category) {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    // Delete a category
    async deleteCategory(id) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
