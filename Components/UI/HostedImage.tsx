"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { imagePath, isAbsoluteFileUrl } from "../helpers/imagepath";
import classes from "./HostedImage.module.css";

export type HostedImageProps = Omit<ImageProps, "src" | "alt"> & {
  /** File name/path as stored on the document. May be undefined/empty. */
  src: string | undefined | null;
  alt?: string;
};

const getFallbackLetter = (alt: string) => {
  const trimmed = alt.trim();
  if (trimmed) return trimmed.charAt(0).toUpperCase();
  // no name to take a letter from: a neutral silhouette, the same in every language
  return (
    <svg viewBox="0 0 24 24" width="55%" height="55%" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z" />
    </svg>
  );
};

/**
 * Wrapper around next/image for server-hosted images whose file name comes
 * from a document field that might be undefined (e.g. `node.image`,
 * `user.avatar`). Instead of falling back to a generic placeholder image,
 * it renders the first letter of `alt` (or a silhouette when `alt` is empty) when
 * `src` is missing, or when the hosted image fails to load.
 */
const HostedImage = ({
  src,
  alt = "",
  className,
  style,
  fill,
  width,
  height,
  onError,
  onLoad,
  ...rest
}: HostedImageProps) => {
  const [failed, setFailed] = useState(false);

  // Reset the failed state whenever we get pointed at a new file, so a
  // previously-broken image doesn't stick around forever on reuse.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${classes.fallback} ${fill ? classes.fill : ""} ${className || ""}`}
        style={fill ? style : { width, height, ...style }}
      >
        <span className={classes.letter}>{getFallbackLetter(alt)}</span>
      </div>
    );
  }

  return (
    <Image
      src={imagePath(src)}
      alt={alt}
      className={className}
      style={style}
      fill={fill}
      width={width}
      height={height}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      onLoad={(e) => {
        setFailed(false);
        onLoad?.(e);
      }}
      {...rest}
      // an absolute URL on another host (an old-site image) is not one the
      // image optimizer may fetch: the browser loads it directly
      unoptimized={rest.unoptimized || isAbsoluteFileUrl(src)}
    />
  );
};

export default HostedImage;
