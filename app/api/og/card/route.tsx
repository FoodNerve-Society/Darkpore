import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse parameters
    const title = searchParams.get('title') || 'Foodnerve Intelligence';
    const blockText = searchParams.get('blockText') || 'No block data provided.';
    const userName = searchParams.get('userName') || 'Anonymous Operator';
    const userRole = searchParams.get('userRole') || 'Member';
    const comment = searchParams.get('comment') || '';
    const avatarUrl = searchParams.get('avatarUrl') || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#000000',
            fontFamily: 'sans-serif',
            padding: '60px',
            color: '#ffffff',
          }}
        >
          {/* Background Gradient Effect */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0) 70%)',
              borderRadius: '50%',
            }}
          />

          {/* LAYER 1: Header (Context) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#f59e0b', borderRadius: '8px', marginRight: '16px' }} />
              <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>Foodnerve Intelligence</span>
            </div>
            <span style={{ fontSize: '32px', color: '#94a3b8', fontWeight: 700, lineHeight: 1.2, maxWidth: '90%' }}>
              {title.length > 80 ? title.substring(0, 80) + '...' : title}
            </span>
          </div>

          {/* LAYER 2: The Meat (Block Text) */}
          <div style={{ display: 'flex', width: '100%', flex: 1, alignItems: 'center', margin: '40px 0' }}>
            <span
              style={{
                fontSize: blockText.length > 100 ? '42px' : '56px',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-1px',
                color: '#ffffff',
                borderLeft: '8px solid #f59e0b',
                paddingLeft: '32px',
              }}
            >
              "{blockText.length > 250 ? blockText.substring(0, 250) + '...' : blockText}"
            </span>
          </div>

          {/* LAYER 3: The User's Take (Social Proof) */}
          {comment && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '40px',
                borderRadius: '24px',
                width: '100%',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '40px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '32px', marginRight: '20px' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800 }}>{userName}</span>
                  <span style={{ fontSize: '20px', color: '#f59e0b', fontWeight: 600 }}>{userRole}</span>
                </div>
              </div>
              <span style={{ fontSize: '32px', color: '#e2e8f0', lineHeight: 1.4, fontWeight: 500 }}>
                {comment}
              </span>
            </div>
          )}

          {/* LAYER 4: The Hook (CTA) */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>Join the Action Group</span>
              <span style={{ fontSize: '20px', color: '#94a3b8', fontWeight: 600 }}>Read the full intelligence report at foodnerve.org</span>
            </div>
            
            {/* Mock QR Code / Brand Element */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
              {/* Note: In a real implementation, a dynamic QR code library would be used here. For OG, we use a static icon or SVG */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (e: any) {
    console.error(`Error generating OG image: ${e.message}`);
    return new Response('Failed to generate image', { status: 500 });
  }
}
