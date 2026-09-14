import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Timothy Pan — engineer, builder, problem solver';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#EFE9D8',
          color: '#14301E',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 72, letterSpacing: -2 }}>Engineer. Builder. Problem solver.</div>
        <div style={{ marginTop: 28, fontSize: 32, color: '#55604F' }}>
          Timothy Pan — computer engineering at Waterloo
        </div>
        <div style={{ marginTop: 40, width: 120, height: 8, backgroundColor: '#B8973F' }} />
      </div>
    ),
    size
  );
}
