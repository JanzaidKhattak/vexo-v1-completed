const CLOUDINARY_CLOUD_NAME = 'dnl7tsshz'
const CLOUDINARY_UPLOAD_PRESET = 'vexo_preset'

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  const data = await res.json()
  return data.secure_url
}