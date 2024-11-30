import { create } from "zustand";

export const useProductStore = create((set) => ({
	products: [],
	setProducts: (products) => set({ products }),

	createProduct: async (newProduct) => {
		if (!newProduct.name || !newProduct.image || !newProduct.price) {
			return { success: false, message: "Please fill in all fields." };
		}
		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newProduct),
			});

			// Handle non-JSON or empty responses
			const data = res.headers.get("content-type")?.includes("application/json")
				? await res.json()
				: { success: false, message: "Invalid server response." };

			if (!res.ok) {
				return { success: false, message: data.message || "Failed to create product." };
			}

			set((state) => ({ products: [...state.products, data.data] }));
			return { success: true, message: "Product created successfully." };
		} catch (error) {
			console.error("Error in createProduct:", error);
			return { success: false, message: "An error occurred. Please try again." };
		}
	},

	fetchProducts: async () => {
		try {
			const res = await fetch("/api/products");
			const data = await res.json();
			set({ products: data.data });
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	},

	deleteProduct: async (pid) => {
		try {
			const res = await fetch(`/api/products/${pid}`, {
				method: "DELETE",
			});
			const data = await res.json();

			if (!data.success) return { success: false, message: data.message };

			set((state) => ({ products: state.products.filter((product) => product._id !== pid) }));
			return { success: true, message: data.message };
		} catch (error) {
			console.error("Error deleting product:", error);
			return { success: false, message: "Failed to delete product. Please try again." };
		}
	},

	updateProduct: async (pid, updatedProduct) => {
		try {
			const res = await fetch(`/api/products/${pid}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updatedProduct),
			});
			const data = await res.json();

			if (!data.success) return { success: false, message: data.message };

			set((state) => ({
				products: state.products.map((product) => (product._id === pid ? data.data : product)),
			}));

			return { success: true, message: data.message };
		} catch (error) {
			console.error("Error updating product:", error);
			return { success: false, message: "Failed to update product. Please try again." };
		}
	},
}));

export default useProductStore;
