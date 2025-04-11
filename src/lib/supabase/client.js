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

// Function to check if the 'images' bucket exists and create it if needed
export async function checkAndCreateImagesBucket() {
    try {
        // First, list all buckets to see if 'images' exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error("Error listing buckets:", listError);
            return false;
        }

        console.log("Available buckets:", buckets.map(b => b.name));

        // Check if 'images' bucket exists
        const imagesBucket = buckets.find(b => b.name === 'images');

        if (!imagesBucket) {
            console.log("'images' bucket not found, creating it...");

            // Bucket doesn't exist, create it
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('images', {
                public: true, // Make the bucket public
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
                fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
            });

            if (createError) {
                console.error("Error creating 'images' bucket:", createError);
                return false;
            }

            console.log("'images' bucket created successfully:", newBucket);
            return true;
        }

        console.log("'images' bucket already exists");
        return true;
    } catch (error) {
        console.error("Error checking/creating bucket:", error);
        return false;
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
        // Validate the file
        if (!file || !file.type) {
            console.error("Invalid file object:", file);
            throw new Error("Invalid file object");
        }

        try {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                throw new Error(`Unsupported file type: ${file.type}`);
            }

            // First make sure the bucket exists
            await checkAndCreateImagesBucket();

            // Generate a unique filename based on timestamp and random string
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${folderPath}/${fileName}`;

            console.log("Starting upload to Supabase Storage", {
                bucket: 'images',
                path: filePath,
                fileType: file.type,
                fileSize: file.size
            });

            // Upload the file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    contentType: file.type, // Set the correct content type
                    upsert: false // Don't overwrite existing files
                });

            if (error) {
                console.error("Supabase storage upload error:", JSON.stringify(error));
                throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
            }

            if (!data) {
                throw new Error("Upload returned no data");
            }

            console.log("Upload successful, getting public URL", { path: data.path });

            // Get public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error("Failed to get public URL");
            }

            console.log("File uploaded successfully with URL:", publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Upload image error:", error.message || error);
            throw error;
        }
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