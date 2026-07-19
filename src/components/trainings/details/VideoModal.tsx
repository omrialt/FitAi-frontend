/**
 * VideoModal - Modal for displaying exercise videos.
 * Pauses playback automatically when the modal is closed.
 */

import { Modal } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { VideoModalProps } from '../../../types/trainings-components.types';

export function VideoModal({ opened, onClose, videoUrl }: VideoModalProps) {
  const { t } = useTranslation();
  const [activeSrc, setActiveSrc] = useState('');

  const getYouTubeEmbedUrl = (url: string): string => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    if (url.includes('youtube.com/embed')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    return url;
  };

  // Set src only when open — clearing it on close stops playback
  useEffect(() => {
    if (opened) {
      setActiveSrc(getYouTubeEmbedUrl(videoUrl));
    } else {
      setActiveSrc('');
    }
  }, [opened, videoUrl]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('trainings.exerciseVideo')}
      size="900"
      centered
    >
      {/* 16:9 aspect ratio container */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        <iframe
          src={activeSrc}
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
