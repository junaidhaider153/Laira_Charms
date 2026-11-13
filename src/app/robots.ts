import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lairacharms.pk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/products/",
          "/categories/",
          "/custom-order",
          "/faq",
          "/shipping",
          "/returns",
        ],
        disallow: [
          "/admin/",
          "/account/",
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

