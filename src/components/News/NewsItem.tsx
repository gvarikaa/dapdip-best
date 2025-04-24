// src/components/News/NewsItem.tsx
import Link from "next/link";
import Image from "../Image";

export type NewsItemType = {
  title: string;
  link: string;
  pubDate: string;
  source_id: string;
  image_url?: string;
};

interface NewsItemProps {
  item: NewsItemType;
}

const NewsItem = ({ item }: NewsItemProps) => {
  return (
    <div className="flex gap-3 hover:bg-gray-900 transition-colors p-2 rounded-lg">
      {item.image_url && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.title}
            w={64}
            h={64}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <Link 
          href={item.link} 
          target="_blank" 
          className="font-bold text-textGrayLight hover:underline"
        >
          {item.title.length > 70 ? `${item.title.substring(0, 70)}...` : item.title}
        </Link>
        <div className="flex justify-between mt-1">
          <span className="text-textGray text-xs">{item.source_id}</span>
          <span className="text-textGray text-xs">
            {new Date(item.pubDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsItem;