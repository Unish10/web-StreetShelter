import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CommentSection = ({ reportId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadComments();
    }, [reportId]);

    const loadComments = async () => {
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:3000/api/comments/report/${reportId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load comments');
            }

            const data = await response.json();
            setComments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim()) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:3000/api/comments/report/${reportId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ 
                    message: newComment,
                    commentType: 'comment'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            const comment = await response.json();
            setComments([...comments, comment]);
            setNewComment('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getUserInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1 
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : names[0].substring(0, 2).toUpperCase();
    };

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin': return '#5b5bd6';
            case 'owner': return '#10b981';
            default: return '#f59e0b';
        }
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'admin': return 'Admin';
            case 'owner': return 'Rescue Owner';
            default: return 'Reporter';
        }
    };

    const currentUser = JSON.parse(localStorage.getItem('user'));

    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{ 
                borderTop: '1px solid #e5e7eb', 
                paddingTop: '20px' 
            }}>
                <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: '#1f2937'
                }}>
                    Comments & Updates ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or update..."
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: '8px'
                    }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {newComment.length}/1000 characters
                        </span>
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            style={{
                                padding: '8px 16px',
                                background: submitting || !newComment.trim() ? '#e5e7eb' : '#5b5bd6',
                                color: submitting || !newComment.trim() ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Comments List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                        Loading comments...
                    </div>
                ) : comments.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '32px', 
                        color: '#9ca3af',
                        background: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {comments.map(comment => (
                            <div key={comment.id} style={{
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: getRoleBadgeColor(comment.user.role),
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        flexShrink: 0
                                    }}>
                                        {getUserInitials(comment.user.username)}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        {/* Header */}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }}>
                                            <div>
                                                <div style={{ 
                                                    fontSize: '14px', 
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    marginBottom: '2px'
                                                }}>
                                                    {comment.user.username}
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        padding: '2px 8px',
                                                        background: getRoleBadgeColor(comment.user.role),
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {getRoleLabel(comment.user.role)}
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    color: '#9ca3af' 
                                                }}>
                                                    {formatDate(comment.createdAt)}
                                                </div>
                                            </div>

                                            {(currentUser.id === comment.userId || currentUser.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        borderRadius: '4px'
                                                    }}
                                                    title="Delete comment"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div style={{ 
                                            fontSize: '14px', 
                                            color: '#374151',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {comment.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

CommentSection.propTypes = {
    reportId: PropTypes.string.isRequired
};

export default CommentSection;
