import { useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function MessageSearch({ channel, onResultClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/messages/${channel._id}/search?q=${encodeURIComponent(value)}`);
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="message-search-wrapper">
      <input
        type="text"
        placeholder="Search messages..."
        value={query}
        onChange={handleSearch}
        className="message-search-input"
      />
      {query && (
        <button className="search-clear-btn" onClick={handleClear}>✕</button>
      )}

      {showResults && (
        <div className="search-results-dropdown">
          {searching ? (
            <p className="search-status">Searching...</p>
          ) : results.length === 0 ? (
            <p className="search-status">No messages found</p>
          ) : (
            results.map((msg) => (
              <div
                key={msg._id}
                className="search-result-item"
                onClick={() => {
                  onResultClick(msg._id);
                  handleClear();
                }}
              >
                <div className="search-result-sender">{msg.sender?.name}</div>
                <div className="search-result-content">{msg.content}</div>
                <div className="search-result-time">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MessageSearch;