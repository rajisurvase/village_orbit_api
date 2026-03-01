// Item related types used by service and hooks

// Backend returns snake_case for item fields. Using same names to stay aligned
export interface Item {
  id: string;
  itemName: string;
  category: string;
  price: number;
  description?: string | null;
  village: string;
  contact: string;
  seller_name?: string;
  image_urls?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  is_available?: boolean;
  rejection_reason?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  villageId? : string
  sold?: boolean;
}

export interface ItemListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  villageId?: string;
}

export interface PaginatedItems {
  content: Item[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index
}

// payload used during create/update (snake_case keys)
export type ItemPayload = Omit<
  Partial<Item>,
  'id' | 'created_at' | 'updated_at' | 'status' | 'rejection_reason'
> & {
  item_name: string;
  category: string;
  price: number;
  contact: string;
  village: string;
};
