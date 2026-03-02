import { useGetFullFilePath } from "@/hooks/useVillagehooks";

const CommonImage = ({
  fileKey,
  className,
}: {
  fileKey: string;
  className?: string;
}) => {
  const { data: signedUrl } = useGetFullFilePath(fileKey);

  if (!signedUrl?.url) return null;

  return (
    <img
      src={signedUrl.url || ""}
      alt={fileKey}
      className={className}
      loading="lazy"
      onError={() => (
        <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl bg-muted">
          📦
        </div>
      )}
    />
  );
};

export default CommonImage;
