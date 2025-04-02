// Helper function to generate random images for users and posts
export const getRandomImage = (id, size = 200) => {
  // Use consistent ID-based seed to always get the same image for the same entity
  const seed = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Different image types
  const imageTypes = [
    'abstract', 'animals', 'business', 'cats', 'city', 'food', 
    'nightlife', 'fashion', 'people', 'nature', 'sports', 'technics', 'transport'
  ];
  
  // Select a consistent image type based on ID
  const imageType = imageTypes[seed % imageTypes.length];
  
  // Create a unique but consistent image ID
  const imageId = (seed % 10) + 1;
  
  // Return the image URL from Lorem Picsum (or another service)
  return `https://picsum.photos/seed/${imageType}${imageId}/${size}/${size}`;
};
