import { useState, useRef, useEffect } from "react";

export default function PictureOfTheDay({ theme, photoURL, onPhotoChange, selectedDate }) {
  // State management
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);

  // Refs for hidden file input and camera
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // File upload handler
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select an image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image must be under 5MB');
      return;
    }

    // Use FileReader to generate preview URL (base64)
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result; // This is base64 data URL
      setPreviewURL(url);
      onPhotoChange(url, file); // Pass both URL and file
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Camera capture handlers
  const handleCameraClick = async () => {
    console.log('Camera button clicked');
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    try {
      console.log('Requesting camera access...');
      
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false 
      });
      
      console.log('Camera access granted', stream);
      streamRef.current = stream;
      setIsCapturing(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video srcObject');
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        } else {
          console.error('Video ref is null');
        }
      }, 100);
    } catch (error) {
      console.error('Camera access error:', error);
      
      // Handle camera permission errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        alert('Camera is being used by another application.');
      } else if (error.name === 'NotSupportedError') {
        alert('Camera access requires HTTPS. Please access this site via https:// or localhost.');
      } else {
        alert(`Failed to access camera: ${error.message}`);
      }
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob, then to base64 for persistence
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the blob
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Convert to base64 data URL for persistence
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target.result; // This is base64 data URL
          setPreviewURL(url);
          onPhotoChange(url, file); // Pass both URL and file
        };
        reader.readAsDataURL(file);
        
        handleCancelCapture();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleCancelCapture = () => {
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  // Attach stream to video element when capturing starts
  useEffect(() => {
    if (isCapturing && streamRef.current && videoRef.current) {
      console.log('Attaching stream to video element');
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCapturing]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Determine which photo to display (preview or saved)
  const displayPhoto = previewURL || photoURL;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Hidden canvas for camera capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Camera capture modal overlay */}
      {isCapturing && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCancelCapture}
        >
          <div 
            className="relative bg-white rounded-lg p-4 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded"
            />
            <div className="flex gap-4 mt-4 justify-center">
              <button
                onClick={handleCapture}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                📷 Capture
              </button>
              <button
                onClick={handleCancelCapture}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Postcard Frame - positioned so bottom-right corner of book is at center of postcard */}
      <div 
        className={`
          absolute -bottom-[75px] -right-[100px] w-[200px] h-[150px]
          transition-all duration-300 ease-in-out
          rotate-[8deg]
          ${theme === 'light' 
            ? 'bg-[#f5f1e8] border-4 border-[#e8dcc4] shadow-lg' 
            : 'bg-[#2a2520] border-4 border-[#4a3f35] shadow-[0_0_15px_rgba(139,115,85,0.3)]'
          }
          rounded-sm overflow-hidden
          hover:rotate-0 hover:scale-105
          cursor-pointer
        `}
      >
        {displayPhoto ? (
          /* Photo Display */
          <div className="relative w-full h-full group">
            <img 
              src={displayPhoto} 
              alt="Daily journal entry" 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Remove button - appears on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent lightbox from opening
                setPreviewURL(null);
                onPhotoChange(null, null); // Pass null for both URL and file
              }}
              className={`
                absolute top-2 right-2 w-6 h-6 rounded-full
                flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                ${theme === 'light'
                  ? 'bg-white text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }
                shadow-md text-xs font-bold
              `}
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Upload Interface */
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div 
              className={`
                text-xs mb-3 text-center font-medium
                ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}
              `}
            >
              Picture of the Day
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCameraClick}
                className={`
                  px-3 py-1.5 rounded text-xs font-medium
                  transition-all duration-200
                  ${theme === 'light'
                    ? 'bg-[#8b7355] text-white hover:bg-[#6f5d45] hover:shadow-md'
                    : 'bg-[#6f5d45] text-gray-100 hover:bg-[#8b7355] hover:shadow-[0_0_8px_rgba(139,115,85,0.4)]'
                  }
                `}
                title="Take photo with camera"
              >
                📷 Camera
              </button>
              <button
                onClick={handleUploadClick}
                className={`
                  px-3 py-1.5 rounded text-xs font-medium
                  transition-all duration-200
                  ${theme === 'light'
                    ? 'bg-[#8b7355] text-white hover:bg-[#6f5d45] hover:shadow-md'
                    : 'bg-[#6f5d45] text-gray-100 hover:bg-[#8b7355] hover:shadow-[0_0_8px_rgba(139,115,85,0.4)]'
                  }
                `}
                title="Upload photo from device"
              >
                📁 Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
