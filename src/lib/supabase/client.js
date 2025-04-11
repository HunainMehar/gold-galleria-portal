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

// Helper functions for working with items
export const itemApi = {
    // Get all items
    async getAllItems() {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get a single item by ID
    async getItemById(id) {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create a new item
    async createItem(item) {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Ensure user_id is set
        const itemData = {
            ...item,
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('items')
            .insert(itemData)
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(
                error.message ||
                'An unexpected error occurred while saving the item'
            );
        }
        return data[0];
    },

    // Update an existing item
    async updateItem(id, item) {
        const { data, error } = await supabase
            .from('items')
            .update(item)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }
};

// Helper functions for working with inventory
export const inventoryApi = {
    // Get all inventory items with their item names
    async getAllInventory() {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
                *,
                item:items(id, name, abbreviation)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get a single inventory item by ID
    async getInventoryById(id) {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
                *,
                item:items(id, name, abbreviation)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get a single inventory item by tag number
    async getInventoryByTagNumber(tagNumber) {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
                *,
                item:items(id, name, abbreviation)
            `)
            .eq('tag_number', tagNumber)
            .single();

        if (error) throw error;
        return data;
    },

    // Create a new inventory item
    async createInventory(inventoryItem) {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Ensure user_id is set and status is 'available'
        const inventoryData = {
            ...inventoryItem,
            user_id: user.id,
            status: 'available' // Ensure status is set to available for new items
        };

        // Remove any calculated fields in case they were accidentally included
        delete inventoryData.total_weight;
        delete inventoryData.pure_gold;

        const { data, error } = await supabase
            .from('inventory')
            .insert(inventoryData)
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(
                error.message ||
                'An unexpected error occurred while saving the inventory item'
            );
        }
        return data[0];
    },

    // Update an existing inventory item
    async updateInventory(id, inventoryItem) {
        // Remove any calculated fields in case they were accidentally included
        const updateData = { ...inventoryItem };
        delete updateData.total_weight;
        delete updateData.pure_gold;
        delete updateData.status; // Prevent changing status through normal update

        const { data, error } = await supabase
            .from('inventory')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    // Upload an image and return the URL
    async uploadImage(file, folderPath = 'inventory') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folderPath}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: publicURL } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicURL.publicUrl;
    },

    // Helper to update inventory status
    async updateInventoryStatus(id, status) {
        if (status !== 'available' && status !== 'sold') {
            throw new Error('Invalid status. Status must be either "available" or "sold"');
        }

        const { data, error } = await supabase
            .from('inventory')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }
};