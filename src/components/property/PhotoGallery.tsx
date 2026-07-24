"use client";

import Image from "next/image";
import { useState } from "react";
import { PHOTO_CATEGORY_LABEL, type PhotoCategory } from "@/lib/constants";

export interface GalleryPhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  category: string;
  caption: string | null;
  altText: string | null;
}

export function PhotoGallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
        画像準備中
      </div>
    );
  }

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="relative col-span-4 aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 sm:col-span-3"
        >
          <Image
            src={photos[0].url}
            alt={photos[0].altText || title}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </button>
        <div className="col-span-4 grid grid-cols-4 gap-2 sm:col-span-2 sm:grid-cols-2">
          {photos.slice(1, 5).map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(i + 1)}
              className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
            >
              <Image
                src={photo.thumbnailUrl || photo.url}
                alt={photo.altText || title}
                fill
                sizes="20vw"
                className="object-cover"
              />
              {i === 3 && photos.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                  +{photos.length - 5}枚
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="写真拡大表示"
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveIndex(null);
            if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));
            if (e.key === "ArrowLeft")
              setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
          }}
        >
          <div className="flex items-center justify-between text-white">
            <span className="text-sm">
              {PHOTO_CATEGORY_LABEL[active.category as PhotoCategory] ?? active.category}
              {active.caption ? ` / ${active.caption}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="tap-target rounded-md border border-white/40 px-3 text-sm"
              aria-label="閉じる"
              autoFocus
            >
              ✕ 閉じる
            </button>
          </div>
          <div className="relative mt-4 flex-1">
            <Image
              src={active.url}
              alt={active.altText || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-white">
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))}
              className="tap-target rounded-md border border-white/40 px-4"
            >
              ← 前へ
            </button>
            <span className="text-sm">
              {activeIndex! + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length))}
              className="tap-target rounded-md border border-white/40 px-4"
            >
              次へ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
