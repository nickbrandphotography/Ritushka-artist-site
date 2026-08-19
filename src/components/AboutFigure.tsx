import Image from 'next/image';

export type FigureSide = 'left' | 'right';

export interface AboutFigureProps {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  side: FigureSide;
  /** Wider column for landscape crops. */
  wide?: boolean;
}

/**
 * A studio photograph floated into the body copy so the text wraps around it.
 * Falls back to a full-width stacked figure below 760px (see globals.css).
 */
export default function AboutFigure({
  src, alt, caption, width, height, side, wide,
}: AboutFigureProps) {
  return (
    <figure
      className={[
        'rt-fig',
        side === 'left' ? 'rt-fig--left' : 'rt-fig--right',
        wide ? 'rt-fig--wide' : '',
      ].join(' ')}
    >
      <span className="rt-fig__mat">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 759px) 100vw, 330px"
          className="h-auto w-full"
        />
      </span>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
