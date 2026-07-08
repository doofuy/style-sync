export interface Item {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  items: Item[];
}