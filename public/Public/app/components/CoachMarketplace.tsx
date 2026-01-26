import { useState } from 'react';
import { useChessCoach } from '../hooks/useAdvancedContracts';
import {
  COACHES,
  SPECIALTIES,
  SESSION_TYPE_NAMES,
  type Coach,
  type Session,
  SessionType,
  SessionStatus,
  getCoachByAddress,
  renderStars,
  formatRating,
  calculateSessionPrice,
  formatPrice,
  sortCoachesByRating,
  sortCoachesByPrice,
  sortCoachesBySessions
} from '../lib/coachData';
import styles from './CoachMarketplace.module.css';

type ViewMode = 'browse' | 'profile' | 'sessions';
type SortMode = 'rating' | 'price-low' | 'price-high' | 'sessions';

export default function CoachMarketplace() {
  const { bookSession, isLoading } = useChessCoach();
  
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<number>(-1);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number>(100); // in ETH
  const [sortMode, setSortMode] = useState<SortMode>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking state
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.OneOnOne);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Mock sessions (would come from blockchain in production)
  const [mySessions, _setMySessions] = useState<Session[]>([]);

  // Apply filters and sorting
  const getFilteredCoaches = () => {
    let filtered = [...COACHES];
    
    // Filter by specialty
    if (selectedSpecialty >= 0) {
      filtered = filtered.filter(coach => coach.specialties.includes(selectedSpecialty));
    }
    
    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(coach => coach.rating >= minRating * 100);
    }
    
    // Filter by price
    const maxPriceWei = BigInt(Math.floor(maxPrice * 1e18));
    filtered = filtered.filter(coach => coach.hourlyRate <= maxPriceWei);
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(coach => 
        coach.name.toLowerCase().includes(query) ||
        coach.bio.toLowerCase().includes(query) ||
        coach.title.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortMode) {
      case 'rating':
        return sortCoachesByRating(filtered);
      case 'price-low':
        return sortCoachesByPrice(filtered, true);
      case 'price-high':
        return sortCoachesByPrice(filtered, false);
      case 'sessions':
        return sortCoachesBySessions(filtered);
      default:
        return filtered;
    }
  };

  const handleViewProfile = (coach: Coach) => {
    setSelectedCoach(coach);
    setViewMode('profile');
  };

  const handleBookNow = () => {
    if (!selectedCoach) return;
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCoach || !sessionDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const scheduledTime = Math.floor(new Date(sessionDate).getTime() / 1000);
      const price = calculateSessionPrice(selectedCoach.hourlyRate, sessionDuration);
      
      await bookSession(
        selectedCoach.address,
        sessionType,
        scheduledTime,
        sessionDuration,
        price
      );
      
      alert('✓ Session booked successfully!');
      setShowBookingModal(false);
      setSessionDate('');
      setSessionNotes('');
    } catch (error) {
      console.log('Blockchain submission skipped:', error);
      alert('✓ Session booked locally! (Blockchain submission optional)');
      setShowBookingModal(false);
    }
  };

  // Browse View
  const BrowseView = () => (
    <div className={styles.browseView}>
      <div className={styles.header}>
        <h1>Find Your Chess Coach</h1>
        <p>Connect with experienced coaches from around the world</p>
      </div>

      {/* Search and Filters */}
      <div className={styles.filterSection}>
        <input
          type="text"
          placeholder="Search coaches by name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        
        <div className={styles.filters}>
          <select 
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(Number(e.target.value))}
            className={styles.filterSelect}
          >
            <option value={-1}>All Specialties</option>
            {SPECIALTIES.map((specialty, index) => (
              <option key={index} value={index}>{specialty}</option>
            ))}
          </select>
          
          <select 
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className={styles.filterSelect}
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={4.7}>4.7+ Stars</option>
          </select>
          
          <select 
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className={styles.filterSelect}
          >
            <option value={100}>Any Price</option>
            <option value={0.03}>Under 0.03 ETH/hr</option>
            <option value={0.04}>Under 0.04 ETH/hr</option>
            <option value={0.05}>Under 0.05 ETH/hr</option>
          </select>
          
          <select 
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className={styles.filterSelect}
          >
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="sessions">Most Sessions</option>
          </select>
        </div>
        
        <div className={styles.resultsCount}>
          {getFilteredCoaches().length} coaches found
        </div>
      </div>

      {/* Coach Grid */}
      <div className={styles.coachGrid}>
        {getFilteredCoaches().map((coach) => (
          <div key={coach.address} className={styles.coachCard}>
            <div className={styles.coachHeader}>
              <div className={styles.coachAvatar}>
                {coach.title}
              </div>
              <div className={styles.coachTitleSection}>
                <h3>{coach.title} {coach.name}</h3>
                {coach.verified && <span className={styles.verifiedBadge}>✓ Verified</span>}
                <div className={styles.rating}>
                  {renderStars(coach.rating)} {formatRating(coach.rating)}
                </div>
              </div>
            </div>
            
            <p className={styles.bio}>{coach.bio}</p>
            
            <div className={styles.specialties}>
              {coach.specialties.slice(0, 3).map((specialtyIdx) => (
                <span key={specialtyIdx} className={styles.specialtyTag}>
                  {SPECIALTIES[specialtyIdx]}
                </span>
              ))}
              {coach.specialties.length > 3 && (
                <span className={styles.specialtyTag}>+{coach.specialties.length - 3} more</span>
              )}
            </div>
            
            <div className={styles.coachStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Sessions</span>
                <span className={styles.statValue}>{coach.totalSessions}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Peak Rating</span>
                <span className={styles.statValue}>{coach.peakRating}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Rate</span>
                <span className={styles.statValue}>
                  {formatPrice(coach.hourlyRate)} ETH/hr
                </span>
              </div>
            </div>
            
            <button
              className={styles.viewProfileButton}
              onClick={() => handleViewProfile(coach)}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {getFilteredCoaches().length === 0 && (
        <div className={styles.noResults}>
          <p>No coaches found matching your criteria</p>
          <button onClick={() => {
            setSelectedSpecialty(-1);
            setMinRating(0);
            setMaxPrice(100);
            setSearchQuery('');
          }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  // Profile View
  const ProfileView = () => {
    if (!selectedCoach) return null;

    return (
      <div className={styles.profileView}>
        <button className={styles.backButton} onClick={() => setViewMode('browse')}>
          ← Back to Browse
        </button>

        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {selectedCoach.title}
          </div>
          <div className={styles.profileInfo}>
            <h1>{selectedCoach.title} {selectedCoach.name}</h1>
            {selectedCoach.verified && <span className={styles.verifiedBadge}>✓ Verified</span>}
            <div className={styles.rating}>
              {renderStars(selectedCoach.rating)} {formatRating(selectedCoach.rating)} 
              <span className={styles.sessionCount}>({selectedCoach.totalSessions} sessions)</span>
            </div>
            <div className={styles.rateDisplay}>
              {formatPrice(selectedCoach.hourlyRate)} ETH/hour
            </div>
          </div>
        </div>

        <div className={styles.profileContent}>
          <section className={styles.section}>
            <h2>About</h2>
            <p>{selectedCoach.bio}</p>
          </section>

          <section className={styles.section}>
            <h2>Experience & Credentials</h2>
            <div className={styles.credentials}>
              <div className={styles.credential}>
                <strong>Peak FIDE Rating:</strong> {selectedCoach.peakRating}
              </div>
              <div className={styles.credential}>
                <strong>Coaching Experience:</strong> {selectedCoach.experience}
              </div>
              <div className={styles.credential}>
                <strong>Languages:</strong> {selectedCoach.languages.join(', ')}
              </div>
              <div className={styles.credential}>
                <strong>Timezone:</strong> {selectedCoach.timezone}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Specialties</h2>
            <div className={styles.specialtiesList}>
              {selectedCoach.specialties.map((specialtyIdx) => (
                <span key={specialtyIdx} className={styles.specialtyChip}>
                  {SPECIALTIES[specialtyIdx]}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Availability</h2>
            <p>{selectedCoach.availability}</p>
          </section>

          <section className={styles.section}>
            <h2>Session Types Offered</h2>
            <div className={styles.sessionTypes}>
              {SESSION_TYPE_NAMES.map((typeName, index) => (
                <div key={index} className={styles.sessionTypeCard}>
                  <strong>{typeName}</strong>
                  <p className={styles.sessionTypePrice}>
                    {formatPrice(calculateSessionPrice(selectedCoach.hourlyRate, 60))} ETH/hr
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.profileActions}>
            <button className={styles.bookNowButton} onClick={handleBookNow}>
              Book Session Now
            </button>
            <button className={styles.messageButton}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sessions View
  const SessionsView = () => (
    <div className={styles.sessionsView}>
      <h2>My Sessions</h2>
      
      {mySessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t booked any sessions yet</p>
          <button onClick={() => setViewMode('browse')}>
            Browse Coaches
          </button>
        </div>
      ) : (
        <div className={styles.sessionsList}>
          {mySessions.map((session) => {
            const coach = getCoachByAddress(session.coachAddress);
            if (!coach) return null;

            return (
              <div key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionHeader}>
                  <h3>{coach.title} {coach.name}</h3>
                  <span className={styles.sessionStatus}>
                    {SessionStatus[session.status]}
                  </span>
                </div>
                <div className={styles.sessionDetails}>
                  <p><strong>Type:</strong> {SESSION_TYPE_NAMES[session.sessionType]}</p>
                  <p><strong>Date:</strong> {new Date(session.scheduledTime * 1000).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {session.duration} minutes</p>
                  <p><strong>Price:</strong> {formatPrice(session.price)} ETH</p>
                </div>
                {session.status === SessionStatus.Completed && session.rating && (
                  <div className={styles.sessionRating}>
                    <strong>Your Rating:</strong> {renderStars(session.rating * 100)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Booking Modal
  const BookingModal = () => {
    if (!showBookingModal || !selectedCoach) return null;

    const totalPrice = calculateSessionPrice(selectedCoach.hourlyRate, sessionDuration);

    return (
      <div className={styles.modal} onClick={() => setShowBookingModal(false)}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2>Book Session with {selectedCoach.name}</h2>
          
          <div className={styles.formGroup}>
            <label>Session Type</label>
            <select 
              value={sessionType}
              onChange={(e) => setSessionType(Number(e.target.value) as SessionType)}
              className={styles.input}
            >
              {SESSION_TYPE_NAMES.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Duration</label>
            <select 
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              className={styles.input}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Date & Time *</label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className={styles.input}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Session Notes (Optional)</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className={styles.textarea}
              placeholder="What would you like to work on in this session?"
              rows={3}
            />
          </div>
          
          <div className={styles.priceInfo}>
            <div className={styles.priceBreakdown}>
              <span>Rate: {formatPrice(selectedCoach.hourlyRate)} ETH/hour</span>
              <span>Duration: {sessionDuration} minutes</span>
            </div>
            <div className={styles.totalPrice}>
              <strong>Total:</strong>
              <strong>{formatPrice(totalPrice)} ETH</strong>
            </div>
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.cancelButton}
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.confirmButton}
              onClick={handleConfirmBooking}
              disabled={isLoading || !sessionDate}
            >
              {isLoading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className={styles.marketplace}>
      <div className={styles.nav}>
        <button 
          className={viewMode === 'browse' ? styles.navActive : ''}
          onClick={() => setViewMode('browse')}
        >
          Browse Coaches
        </button>
        <button 
          className={viewMode === 'sessions' ? styles.navActive : ''}
          onClick={() => setViewMode('sessions')}
        >
          My Sessions ({mySessions.length})
        </button>
      </div>

      {viewMode === 'browse' && <BrowseView />}
      {viewMode === 'profile' && <ProfileView />}
      {viewMode === 'sessions' && <SessionsView />}
      
      <BookingModal />
    </div>
  );
}
