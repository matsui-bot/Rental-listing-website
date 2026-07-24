"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { PHOTO_CATEGORY, PHOTO_CATEGORY_LABEL, type PhotoCategory } from "@/lib/constants";
import {
  uploadPhotos,
  deletePhoto,
  setMainPhoto,
  reorderPhotos,
  updatePhotoMeta,
} from "@/app/admin/(protected)/photos/actions";

export interface PhotoDTO {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  category: string;
  caption: string | null;
  altText: string | null;
  isMain: boolean;
  order: number;
}

export function PhotoManager({
  targetType,
  targetId,
  initialPhotos,
}: {
  targetType: "BUILDING" | "UNIT";
  targetId: string;
  initialPhotos: PhotoDTO[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadCategory, setUploadCategory] = useState<PhotoCategory>("LIVING");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reload(next: PhotoDTO[]) {
    setPhotos(next);
  }

  function handleUpload(formData: FormData) {
    formData.set("targetType", targetType);
    formData.set("targetId", targetId);
    formData.set("category", uploadCategory);
    setError(null);
    startTransition(async () => {
      const result = await uploadPhotos(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  function handleDelete(photoId: string) {
    if (!window.confirm("この写真を削除しますか?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePhoto(photoId, targetType, targetId);
      if (result.error) {
        setError(result.error);
        return;
      }
      reload(photos.filter((p) => p.id !== photoId));
    });
  }

  function handleSetMain(photoId: string) {
    setError(null);
    startTransition(async () => {
      const result = await setMainPhoto(photoId, targetType, targetId);
      if (result.error) {
        setError(result.error);
        return;
      }
      reload(photos.map((p) => ({ ...p, isMain: p.id === photoId })));
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setPhotos(next);
    setDragIndex(null);
    startTransition(async () => {
      await reorderPhotos(targetType, targetId, next.map((p) => p.id));
    });
  }

  function handleMetaSave(photoId: string, formData: FormData) {
    formData.set("photoId", photoId);
    formData.set("targetType", targetType);
    formData.set("targetId", targetId);
    startTransition(async () => {
      const result = await updatePhotoMeta(formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form
        action={(fd) => handleUpload(fd)}
        className="mb-6 flex flex-col gap-3 rounded-md border border-dashed border-neutral-300 p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          写真種別
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as PhotoCategory)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          >
            {Object.values(PHOTO_CATEGORY).map((c) => (
              <option key={c} value={c}>
                {PHOTO_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-neutral-700">
          画像ファイル(複数選択可・JPEG/PNG/WebP・8MBまで)
          <input ref={fileInputRef} type="file" name="files" multiple accept="image/jpeg,image/png,image/webp" className="text-sm" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="tap-target rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "処理中..." : "アップロード"}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-400">写真が登録されていません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`cursor-move rounded-lg border p-3 ${photo.isMain ? "border-brand-500 bg-brand-50" : "border-neutral-200"}`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100">
                <Image src={photo.thumbnailUrl || photo.url} alt={photo.altText || ""} fill sizes="300px" className="object-cover" />
                {photo.isMain && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                    メイン
                  </span>
                )}
              </div>

              <form action={(fd) => handleMetaSave(photo.id, fd)} className="mt-2 flex flex-col gap-1.5">
                <select name="category" defaultValue={photo.category} className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
                  {Object.values(PHOTO_CATEGORY).map((c) => (
                    <option key={c} value={c}>
                      {PHOTO_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="caption"
                  defaultValue={photo.caption ?? ""}
                  placeholder="キャプション"
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  name="altText"
                  defaultValue={photo.altText ?? ""}
                  placeholder="altテキスト(代替文言)"
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <button type="submit" className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
                    保存
                  </button>
                  {!photo.isMain && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(photo.id)}
                      className="rounded-md border border-brand-300 px-2 py-1 text-xs text-brand-700"
                    >
                      メインに設定
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
                  >
                    削除
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-neutral-400">カードをドラッグ&ドロップすると表示順を変更できます。</p>
    </div>
  );
}
