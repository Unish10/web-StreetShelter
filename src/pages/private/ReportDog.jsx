import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dogReportSchema } from './schema/dogReport.schema';
import { dogReportsAPI } from '../../utils/api';
import LocationPicker from '../../components/shared/LocationPicker';
import './ReportDog.css';


const SafeLocationPicker = ({ onLocationSelect, initialPosition }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError) {
        return (
            <div style={{
                padding: '20px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b'
            }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Map component unavailable. You can still submit your report with the location description.
                </p>
            </div>
        );
    }
    
    try {
        return <LocationPicker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />;
    } catch (error) {
        setHasError(true);
        return null;
    }
};

const ReportDog = ({ embedded = false, onSuccess }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [user, setUser] = useState(null);
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, clearErrors } = useForm({
        resolver: zodResolver(dogReportSchema)
    });

    const imageFiles = watch('image');

    
    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            
            const totalFiles = imagePreviews.length + newFiles.length;
            if (totalFiles > 20) {
                alert(`You can only upload up to 20 photos. You currently have ${imagePreviews.length} photo(s).`);
                e.target.value = ''; 
                return;
            }
            
            const newPreviews = [];
            let loadedCount = 0;
            
            newFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result);
                    loadedCount++;
                    
                    if (loadedCount === newFiles.length) {
                        
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                        
                        setSelectedFiles(prev => [...prev, ...newFiles]);
                        
                        clearErrors('image');
                    }
                };
                reader.readAsDataURL(file);
            });
            
            
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
        setSelectedFiles(newFiles);
        
        if (newFiles.length === 0) {
            trigger('image'); 
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        setSuccess(false);
        
        
        if (selectedFiles.length === 0) {
            setError('Please upload at least one photo');
            setIsSubmitting(false);
            return;
        }
        
        
        if (!data.location || data.location.trim().length < 5) {
            setError('Please enter a valid location (at least 5 characters)');
            setIsSubmitting(false);
            return;
        }
        
        
        if (!data.description || data.description.trim().length < 10) {
            setError('Please enter a detailed description (at least 10 characters)');
            setIsSubmitting(false);
            return;
        }
        
        
        let reportCoordinates = coordinates;
        if (!coordinates) {
            
            reportCoordinates = { lat: 27.7172, lng: 85.3240 };
        }
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.token) {
                throw new Error('User not authenticated. Please login again.');
            }
            
            
            const formData = new FormData();
            
            selectedFiles.forEach((file, index) => {
                formData.append('images', file);  
            });
            formData.append('location', data.location);
            formData.append('description', data.description);
            if (data.additionalNotes) {
                formData.append('additionalNotes', data.additionalNotes);
            }
            
            
            if (reportCoordinates) {
                formData.append('latitude', reportCoordinates.lat);
                formData.append('longitude', reportCoordinates.lng);
            }
            
            
            const reporterName = user.username || user.name || 'Anonymous';
            const reporterEmail = user.email || '';
            const reporterPhone = user.phone || '';
            
            formData.append('reporter_name', reporterName);
            formData.append('reporter_email', reporterEmail);
            formData.append('reporter_phone', reporterPhone);
            
            
            const newReport = await dogReportsAPI.create(formData);
            
            
            window.dispatchEvent(new CustomEvent('reportSubmitted', { detail: newReport }));
            
            
            setSuccess(true);
            setIsSubmitting(false);
            
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            
            if (embedded && onSuccess) {
                onSuccess();
            } else {
                
                navigate('/dashboard/reporter', { replace: true });
            }
            
        } catch (err) {
            setError(err.message || 'Failed to submit report. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        
        if (newFiles.length > 0) {
            
            const totalFiles = imagePreviews.length + newFiles.length;
            if (totalFiles > 20) {
                alert(`You can only upload up to 20 photos. You currently have ${imagePreviews.length} photo(s).`);
                return;
            }
            
            const newPreviews = [];
            let loadedCount = 0;
            
            newFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result);
                    loadedCount++;
                    
                    if (loadedCount === newFiles.length) {
                        
                        setImagePreviews(prev => [...prev, ...newPreviews]);
                        
                        setSelectedFiles(prev => [...prev, ...newFiles]);
                        
                        clearErrors('image');
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    return (
        <div className={`report-page ${embedded ? 'embedded' : ''}`}>
            <div className="report-container">
                
                {!embedded && (
                    <div className="report-header">
                        <div className="logo">
                            <span className="logo-icon"></span>
                            <span>
                                <span className="logo-text-street">Street</span>
                                <span className="logo-text-shelter">Shelter</span>
                            </span>
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="back-link">
                            ← Back to Dashboard
                        </a>
                    </div>
                )}

                {/* Report Card */}
                <div className="report-card">
                    <div className="report-card-header">
                        <div className="report-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <div className="report-title-section">
                            <h1>Report a Street Animal</h1>
                            <p className="report-subtitle">
                                Your report helps our rescue teams find and provide immediate care to animals in need.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="success-message" style={{
                            background: '#d1fae5',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ 
                                margin: 0, 
                                color: '#065f46', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Report submitted successfully! Redirecting to your dashboard...
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit, (errors) => {
                        // Show specific validation errors
                        const errorMessages = [];
                        if (errors.location) errorMessages.push(errors.location.message);
                        if (errors.description) errorMessages.push(errors.description.message);
                        if (errors.image) errorMessages.push(errors.image.message);
                        
                        const errorText = errorMessages.join('. ') || 'Please check all fields and try again';
                        setError(errorText);
                        setIsSubmitting(false);
                    })} className="report-form">
                        {/* Upload Photo */}
                        <div className="form-group">
                            <label className="form-label">
                                Upload Photo <span className="required">*</span>
                            </label>
                            <div 
                                className={`upload-area ${imagePreviews.length > 0 ? 'has-file' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('image-input').click()}
                            >
                                <div className="upload-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="upload-text">Drag and drop your photos here</p>
                                <p className="upload-subtext">Supports JPEG, PNG up to 10MB each • Max 20 photos</p>
                                <button type="button" className="browse-button">
                                    Browse Files
                                </button>
                                <input 
                                    id="image-input"
                                    type="file" 
                                    {...register('image')}
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="upload-input"
                                    multiple
                                />
                            </div>
                            {errors.image && imagePreviews.length === 0 && (
                                <p className="field-error">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.image.message}
                                </p>
                            )}
                            {imagePreviews.length > 0 && (
                                <div className="images-preview-grid">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                className="remove-image-btn"
                                            >
                                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <span className="image-number">{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label className="form-label">
                                Location <span className="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                {...register('location')}
                                placeholder="e.g., Near Central Park, Main Street, next to the cafe"
                                className="form-input"
                            />
                            {errors.location && (
                                <p className="field-error">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.location.message}
                                </p>
                            )}
                            
                            {/* Map Integration */}
                            <div style={{ marginTop: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                                    Select Exact Location on Map <span style={{ color: '#9ca3af', fontWeight: 400}}>(Optional)</span>
                                </label>
                                <SafeLocationPicker 
                                    onLocationSelect={setCoordinates}
                                    initialPosition={coordinates}
                                />
                                {coordinates && (
                                    <p style={{ marginTop: '8px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        Location selected on map
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">
                                Description <span className="required">*</span>
                            </label>
                            <textarea 
                                {...register('description')}
                                placeholder="Describe the animal's appearance, condition (injured, hungry, scared), and behavior..."
                                className="form-textarea"
                            />
                            {errors.description && (
                                <p className="field-error">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div className="form-group">
                            <label className="form-label">
                                Additional Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                            </label>
                            <textarea 
                                {...register('additionalNotes')}
                                placeholder="Any other information that might be helpful for the rescue team..."
                                className="form-textarea"
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions">
                            {!embedded && (
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/dashboard')}
                                    className="btn btn-cancel"
                                >
                                    Cancel
                                </button>
                            )}
                            <button 
                                type="submit" 
                                disabled={isSubmitting || success}
                                className="btn btn-submit"
                                style={{ 
                                    cursor: (isSubmitting || success) ? 'not-allowed' : 'pointer',
                                    opacity: (isSubmitting || success) ? 0.6 : 1
                                }}
                            >
                                {success ? (
                                    <>
                                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ display: 'inline' }}>
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                        <span style={{ marginLeft: '8px' }}>Submitted!</span>
                                    </>
                                ) : isSubmitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span style={{ marginLeft: '8px' }}>Submitting...</span>
                                    </>
                                ) : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer - hidden in embedded mode */}
                {!embedded && (
                    <div className="report-footer">
                        <p className="footer-text">© 2024 StreetShelter Platform. All rights reserved. Your privacy is protected.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDog;
