import Image from 'next/image';

interface Recommendation {
  id: number;
  productId: number;
  productName: string;
  type: string;
  userId: number;
  score: number;
}

interface Props {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: Props) {
  return (
    <div className="flex gap-3 items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      {/* Placeholder for product image - replace with actual image URL when available */}
      <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
        <Image
          src={'/product-placeholder.png'} // Replace with actual image URL
          alt={recommendation.productName}
          fill
          className="object-contain p-2 bg-gray-50"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
          {recommendation.productName}
        </h3>
        <p className="text-xs text-gray-500">Type: {recommendation.type}</p>
        <p className="text-xs text-gray-500">Score: {recommendation.score.toFixed(2)}</p>
      </div>
    </div>
  );
}
