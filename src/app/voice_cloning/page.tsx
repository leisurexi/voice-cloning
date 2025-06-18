"use client";

import React, { useState } from "react";
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

export default function VoiceCloningPage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError(null);
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

  const handleButtonClick = () => {
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
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
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button disabled={!selectedFile || isUploading}>
            Start Cloning
          </Button>
        </div>
      </div>
    </main>
  );
}
