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
      title={
        <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
          {t('trainings.exerciseVideo')}
        </h3>
      }
      size="900"
      centered
    >
      {/* 16:9 frame.
          Letterboxing is black in both themes, so this is one of the few places
          a literal beats a token: `bg-inverse-surface` looked right only while
          the palette was light-only — once dark landed it inverted to near-white
          and framed the video in a bright box. */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={activeSrc}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={t('trainings.exerciseVideo')}
        />
      </div>
    </Modal>
  );
}
