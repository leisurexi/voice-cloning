"use client";

import React, { useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Download } from "lucide-react";

export default function Home() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError(null);
    setCloneError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'voice_clone');

      // 使用 XMLHttpRequest 来支持上传进度
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
        const progress = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(progress);
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log('Upload successful:', response);
          setFileId(response.file.file_id);
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error');
      });

      // 使用本地 API Route
      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClone = async () => {
    if (!fileId || !voiceName) {
      setCloneError('Please provide both file and voice name');
      return;
    }

    if (!text.trim()) {
      setCloneError('Please enter text for voice cloning');
      return;
    }

    setIsCloning(true);
    setCloneError(null);

    try {
      const response = await fetch('/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          voice_name: voiceName,
          text: text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Clone failed');
      }

      console.log('Clone successful:', data);
      setAudioUrl(data.demo_audio);
      
    } catch (error) {
      setCloneError(error instanceof Error ? error.message : 'Clone failed');
    } finally {
      setIsCloning(false);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `cloned_voice_${voiceName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Voice Cloning</h1>
        
        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-upload"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button 
                  variant="default" 
                  disabled={isUploading}
                  onClick={handleButtonClick}
                >
                  {isUploading ? "Uploading..." : "Choose Audio File"}
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supported formats: MP3, WAV, M4A
                </p>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Selected File Info */}
                {selectedFile && !isUploading && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {uploadError && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                    <p className="text-sm">{uploadError}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cloning Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Voice Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter a name for your voice"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    disabled={isCloning}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Text to Clone
                  </label>
                  <Textarea
                    placeholder="Enter the text you want to clone"
                    value={text}
                    onChange={handleTextChange}
                    disabled={isCloning}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Quality
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clone Error Message */}
                {cloneError && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                    <p className="text-sm">{cloneError}</p>
                  </div>
                )}

                {/* Audio Player */}
                {audioUrl && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1">
                        <Progress value={(currentTime / duration) * 100} className="w-full" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Cancel
            </Button>
            <Button 
              disabled={!selectedFile || isUploading || isCloning || !fileId || !voiceName || !text.trim()}
              onClick={handleClone}
            >
              {isCloning ? "Cloning..." : "Start Cloning"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
