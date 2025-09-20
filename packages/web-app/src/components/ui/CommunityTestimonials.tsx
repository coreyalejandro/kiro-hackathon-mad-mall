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
          <Header variant="h2">
            Voices from Our Community
          </Header>
          <Box color="text-body-secondary" fontSize="body-s">
            Real stories from real sisters finding healing and joy together
          </Box>
        </Box>

        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
          {testimonials.map((testimonial) => (
            <Box key={testimonial.id} variant="div" padding="m">
              <SpaceBetween size="m">
                <Box textAlign="center">
                  <CommunityImage 
                    category="portraits"
                    size="small"
                    rounded={true}
                  />
                </Box>

                <Box textAlign="center">
                  <Box 
                    fontSize="body-m" 
                    fontStyle="italic" 
                    color="text-body-secondary"
                    margin={{ bottom: "s" }}
                  >
                    "{testimonial.quote}"
                  </Box>
                </Box>

                <Box textAlign="center">
                  <Box 
                    fontSize="heading-s" 
                    fontWeight="bold" 
                    color="text-body-default"
                    margin={{ bottom: "xs" }}
                  >
                    {testimonial.name}
                  </Box>
                  <Box 
                    fontSize="body-s" 
                    color="text-status-info"
                    margin={{ bottom: "xs" }}
                  >
                    {testimonial.role}
                  </Box>
                  <Box 
                    fontSize="body-s" 
                    color="text-body-secondary"
                  >
                    {testimonial.location} • Member since {testimonial.memberSince}
                  </Box>
                </Box>
              </SpaceBetween>
            </Box>
          ))}
        </Grid>
      </SpaceBetween>
    </Container>
  );
}
