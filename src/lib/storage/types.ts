export interface SavedImage {
  /** 公開URL(表示に使用する元画像) */
  url: string;
  /** サムネイルURL(一覧・カード表示用) */
  thumbnailUrl: string;
}

export interface StorageProvider {
  /**
   * 画像を保存し、元画像とサムネイルのURLを返す。
   * 実装側で圧縮・リサイズ・サムネイル生成を行う。
   */
  saveImage(buffer: Buffer, originalFileName: string): Promise<SavedImage>;
  /** 保存済み画像を削除する(元画像・サムネイル両方) */
  deleteImage(url: string): Promise<void>;
}
