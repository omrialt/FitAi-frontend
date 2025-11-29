/**
 * VideoModal - Modal for displaying exercise videos with autoplay
 */

import { Modal } from '@mantine/core';

interface VideoModalProps {
  opened: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function VideoModal({ opened, onClose, videoUrl }: VideoModalProps) {
  // Check if it's a YouTube URL and extract video ID
  const getYouTubeEmbedUrl = (url: string): string => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    // If it's already an embed URL, add autoplay
    if (url.includes('youtube.com/embed')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Exercise Video"
      size="xl"
      centered
    >
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Exercise Video"
        />
      </div>
    </Modal>
  );
}
