import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from './items.service';
import { ItemListParams, ItemPayload, Item } from './items.types';
import { ApiResponse } from '../apiClient';

// fetch hooks
export const useItems = (params: ItemListParams = {}) => {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => itemsService.getItems(params),
    enabled : Boolean(params.villageId), // require villageId for items query
    select: data => data.data,
  });
};

export const useItem = (id: string) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsService.getItemById(id),
    enabled: Boolean(id),
    select: data => data.data,
  });
};

export const useMyItems = (params: ItemListParams = {}) => {
  return useQuery({
    queryKey: ['myItems', params],
    queryFn: () => itemsService.getMyItems(params),
     enabled : Boolean(params.villageId), 
    select: data => data.data,
  });
};

// mutation hooks
export const useCreateItem = () => {
  const qc = useQueryClient();
  return useMutation<ApiResponse<Item>, Error, ItemPayload>({
    mutationFn: (payload: ItemPayload) => itemsService.createItem(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['myItems'] });
    },
  });
};

export const useUpdateItem = (id: string) => {
  const qc = useQueryClient();
  return useMutation<ApiResponse<Item>, Error, Partial<ItemPayload>>({
    mutationFn: (payload: Partial<ItemPayload>) => itemsService.updateItem(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['item', id] });
      qc.invalidateQueries({ queryKey: ['myItems'] });
    },
  });
};

export const useActionTriggerItem = () => {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ message: string } | Item>, Error, { id: string; type: "DELETE" | "SOLD" | "IS_AVAILABLE", item?: Partial<Item> }>({
    mutationFn: ({id, type, item}) => {
      if (type === "SOLD") {
        return itemsService.soldItem(id);
      } else if(type ==="DELETE") {
        return itemsService.deleteItem(id);
      } return itemsService.updateItem(id, item)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      qc.invalidateQueries({ queryKey: ['myItems'] });
    },
  });
};




// admin action

export const useAdminActionOnBuySellItem = () => {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ message: string }>, Error, { id: string;  type: "approve" | "reject" | "delete", reason: string }>({
    mutationFn: ({ id, type, reason }: { id: string; type: "approve" | "reject", reason: string }) => type ==="approve" ? itemsService.approveItem(id) : type==="reject"? itemsService.rejectItem(id, reason) : itemsService.deleteItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
};

