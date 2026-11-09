import { useSearchParams } from "react-router-dom";
import { GalleryPage } from "@/components/landing/Galerie";

export default function GalleryRoute() {
    const [params] = useSearchParams();
    const type = params.get("type");
    const initialFilter = type === "images" ? "IMAGE" : type === "videos" ? "VIDEO" : "ALL";
    return <GalleryPage key={initialFilter} initialFilter={initialFilter} />;
}
