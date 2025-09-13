import React from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/concourse-interactions.css';

export function ConcourseContent() {
  const router = useRouter();

  const handlePeerCirclesClick = () => {
    router.push('/circles');
  };

  const communityActivity: Array<string> = [
    'Tasha joined Peer Circles',
    'New discussion: Managing Anxiety Together',
    '5 new comedy clips this week',
  ];

  return (
    <div>
      <section className="mall-sections-grid">
        <div
          data-testid="mall-section-peer-circles"
          className="mall-section-card"
          onClick={handlePeerCirclesClick}
          role="button"
          aria-label="Visit Peer Circles"
          tabIndex={0}
        >
          <div className="mall-section-icon" aria-hidden>👥</div>
          <h2>Peer Circles</h2>
          <p>Connect with sisters who understand your journey.</p>
        </div>
      </section>

      <section>
        <h3>Community Activity</h3>
        <ul className="community-activity-list">
          {communityActivity.map((item, index) => (
            <li key={index} className="community-activity-item">{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ConcourseContent;