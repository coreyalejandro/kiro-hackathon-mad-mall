import React from 'react';
import {
  Container,
  Header,
  Grid,
  Box,
  SpaceBetween
} from '@cloudscape-design/components';
import CommunityImage from './CommunityImage';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
  location: string;
  memberSince: string;
}

interface CommunityTestimonialsProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Keisha M.",
    role: "Thyroid Warrior",
    quote: "This community saved my life. Finding sisters who truly understand what I'm going through has been healing beyond words.",
    image: "testimonial1",
    location: "Atlanta, GA",
    memberSince: "2023"
  },
  {
    id: 2,
    name: "Amara J.",
    role: "Peer Circle Leader",
    quote: "The Comedy Lounge helped me find joy again during my darkest moments. Laughter really is medicine for the soul.",
    image: "testimonial2",
    location: "Houston, TX",
    memberSince: "2022"
  },
  {
    id: 3,
    name: "Zara W.",
    role: "Wellness Advocate",
    quote: "The marketplace connected me with Black-owned brands that actually understand my needs. It's more than shopping - it's community care.",
    image: "testimonial3",
    location: "Oakland, CA",
    memberSince: "2023"
  }
];

export default function CommunityTestimonials({ 
  testimonials = defaultTestimonials 
}: CommunityTestimonialsProps) {
  return (
    <Container>
      <SpaceBetween size="l">
        <Box textAlign="center">
          <Header variant="h2" className="text-rich-umber">
            Voices from Our Community
          </Header>
          <Box color="text-body-secondary" fontSize="body-s">
            Real stories from real sisters finding healing and joy together
          </Box>
        </Box>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id}>
              <SpaceBetween size="m">
                <Box textAlign="center">
                  <CommunityImage 
                    category="portraits"
                    size="small"
                    rounded={true}
                    style={{ 
                      margin: '0 auto',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </Box>

                <Box textAlign="center">
                  <div className="testimonial-quote">
                    "{testimonial.quote}"
                  </div>
                </Box>

                <Box textAlign="center">
                  <div className="testimonial-name">
                    {testimonial.name}
                  </div>
                  <div className="testimonial-role">
                    {testimonial.role}
                  </div>
                  <div className="testimonial-location">
                    {testimonial.location} • Member since {testimonial.memberSince}
                  </div>
                </Box>
              </SpaceBetween>
            </div>
          ))}
        </Grid>
      </SpaceBetween>
    </Container>
  );
}
