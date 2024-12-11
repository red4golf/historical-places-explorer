import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Image, 
  Upload, 
  X, 
  AlertCircle,
  FileImage,
  Loader2
} from 'lucide-react';

export const MediaUploader = ({ 
  onMediaAdd, 
  existingMedia = [], 
  maxFiles = 5, 
  maxFileSize = 5 // in MB 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    if (!file.type.startsWith('image/')) {
      errors.push('Only image files are allowed');
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`File size must be less than ${maxFileSize}MB`);
    }

    return errors;
  };

  const processFiles = async (files) => {
    if (existingMedia.length + selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      errors: validateFile(file)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    await processFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    await processFiles(files);
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    const totalFiles = selectedFiles.length;
    let uploaded = 0;

    try {
      const uploadedFiles = [];

      for (const fileData of selectedFiles) {
        if (fileData.errors.length > 0) continue;

        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('caption', fileData.caption);

        const response = await fetch('/api/locations/media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${fileData.file.name}`);
        }

        const result = await response.json();
        uploadedFiles.push({
          path: result.path,
          caption: fileData.caption,
          filename: result.filename
        });

        uploaded++;
        setUploadProgress((uploaded / totalFiles) * 100);
      }

      onMediaAdd(uploadedFiles);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFiles([]);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-32 w-full flex flex-col items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <Image className="h-6 w-6 mb-2" />
        Add Photos
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <FileImage className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop your files here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Maximum {maxFiles} files, {maxFileSize}MB each
              </p>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {selectedFiles.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 border rounded-lg relative"
                    >
                      <img
                        src={fileData.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{fileData.file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(fileData.file.size / (1024 * 1024)).toFixed(2)}MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              URL.revokeObjectURL(fileData.preview);
                              setSelectedFiles(prev => 
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {fileData.errors.length > 0 ? (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {fileData.errors.join(', ')}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="mt-2">
                            <Label>Caption</Label>
                            <Textarea
                              value={fileData.caption}
                              onChange={(e) => {
                                setSelectedFiles(prev => {
                                  const newFiles = [...prev];
                                  newFiles[index].caption = e.target.value;
                                  return newFiles;
                                });
                              }}
                              placeholder="Add a caption..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-gray-500">
                  Uploading files...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Files'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};