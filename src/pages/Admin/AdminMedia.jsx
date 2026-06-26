import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { API_BASE_URL } from '../../config/api'

function AdminMedia() {
  const [mediaFiles, setMediaFiles] = useState([])
  const [children, setChildren] = useState([])
  const [selectedMediaId, setSelectedMediaId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'gallery',
    relatedId: '',
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function fetchMediaFiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/media`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load media files')
      }

      setMediaFiles(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load media files.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchChildren() {
    try {
      const response = await fetch(`${API_BASE_URL}/children`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load children')
      }

      setChildren(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load children list.')
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
      ...(name === 'category' && value !== 'child'
        ? { relatedId: '' }
        : {}),
    }))
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0])
  }

  function toggleMediaDetails(id) {
    setSelectedMediaId((currentId) => (currentId === id ? null : id))
  }

  function formatDate(dateValue) {
    if (!dateValue) return 'Not recorded'

    return new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatFileSize(size) {
    if (!size) return 'Unknown size'

    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  function getRelatedChildName(relatedId) {
    const child = children.find(
      (childItem) => String(childItem.id) === String(relatedId)
    )

    return child?.fullName || child?.full_name || 'Not linked'
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('Please select an image to upload.')
      return
    }

    if (formData.category === 'child' && !formData.relatedId) {
      setErrorMessage('Please select the child this photo belongs to.')
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage('')
      setSuccessMessage('')

      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('category', formData.category)
      uploadData.append('file', selectedFile)

      if (formData.category === 'child') {
        uploadData.append('relatedType', 'child')
        uploadData.append('relatedId', formData.relatedId)
      }

      const response = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        body: uploadData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload media file')
      }

      setMediaFiles((currentFiles) => [data.data, ...currentFiles])
      setFormData({
        title: '',
        description: '',
        category: 'gallery',
        relatedId: '',
      })
      setSelectedFile(null)
      setSuccessMessage('Media file uploaded successfully.')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not upload media file.')
    } finally {
      setIsUploading(false)
    }
  }

  async function deleteMediaFile(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this media file?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete media file')
      }

      setMediaFiles((currentFiles) =>
        currentFiles.filter((file) => String(file.id) !== String(id))
      )

      setSuccessMessage('Media file deleted successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete media file.')
      setSuccessMessage('')
    }
  }

  useEffect(() => {
    fetchMediaFiles()
    fetchChildren()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Media Management</h1>

          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <section className="admin-quick-actions">
            <h3>Upload Media</h3>

            <form className="donation-form" onSubmit={handleUpload}>
              <input
                type="text"
                name="title"
                placeholder="Media Title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description or caption"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="hero">Hero Image</option>
                <option value="gallery">Gallery</option>
                <option value="child">Child Photo</option>
                <option value="sponsor">Sponsor Photo</option>
                <option value="event">Event Photo</option>
                <option value="project">Project Photo</option>
              </select>

              {formData.category === 'child' && (
                <select
                  name="relatedId"
                  value={formData.relatedId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Child</option>

                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.fullName || child.full_name}
                    </option>
                  ))}
                </select>
              )}

              <input type="file" accept="image/*" onChange={handleFileChange} />

              <button
                type="submit"
                className="btn btn--primary"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Media'}
              </button>
            </form>
          </section>

          <section className="admin-quick-actions">
            <h3>Media Library</h3>

            {loading && <p>Loading media files...</p>}

            {!loading && mediaFiles.length === 0 && (
              <p>No media files uploaded yet.</p>
            )}

            <div className="media-floating-grid">
              {mediaFiles.map((file) => {
                const isSelected = selectedMediaId === file.id

                return (
                  <article
                    className={`media-floating-card ${
                      isSelected ? 'media-floating-card--active' : ''
                    }`}
                    key={file.id}
                  >
                    <button
                      type="button"
                      className="media-floating-card__image-button"
                      onClick={() => toggleMediaDetails(file.id)}
                      aria-label={`View details for ${file.title}`}
                    >
                      <img
                        src={file.publicUrl}
                        alt={file.title}
                        className="media-floating-card__image"
                      />

                      <span className="media-floating-card__badge">
                        {file.category}
                      </span>
                    </button>

                    {isSelected && (
                      <div className="media-floating-card__details">
                        <h3>{file.title}</h3>

                        <p>{file.description || 'No description added.'}</p>

                        <div className="media-floating-card__meta">
                          <span>
                            <strong>File:</strong> {file.originalFilename}
                          </span>

                          <span>
                            <strong>Size:</strong>{' '}
                            {formatFileSize(file.fileSize)}
                          </span>

                          <span>
                            <strong>Uploaded:</strong>{' '}
                            {formatDate(file.createdAt)}
                          </span>

                          {file.relatedType === 'child' && (
                            <span>
                              <strong>Linked Child:</strong>{' '}
                              {getRelatedChildName(file.relatedId)}
                            </span>
                          )}
                        </div>

                        <div className="media-floating-card__actions">
                          <a
                            className="btn btn--secondary"
                            href={file.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>

                          <button
                            className="btn btn--danger"
                            type="button"
                            onClick={() => deleteMediaFile(file.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminMedia