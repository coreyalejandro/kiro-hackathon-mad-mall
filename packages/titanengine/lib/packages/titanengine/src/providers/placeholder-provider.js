"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderProvider = void 0;
class PlaceholderProvider {
    async generate(params) {
        const n = params.count ?? 3;
        return Array.from({ length: n }).map((_, idx) => ({
            url: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/1200/800`,
            altText: `${params.category} placeholder`,
            category: params.category,
            source: 'stock',
            sourceInfo: { provider: 'placeholder' },
            tags: [params.category],
            thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/600/400`,
        }));
    }
}
exports.PlaceholderProvider = PlaceholderProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3BsYWNlaG9sZGVyLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWVBLE1BQWEsbUJBQW1CO0lBQzlCLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBeUI7UUFDdEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoRCxHQUFHLEVBQUUsOEJBQThCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFdBQVc7WUFDeEYsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsY0FBYztZQUN6QyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7WUFDekIsTUFBTSxFQUFFLE9BQU87WUFDZixVQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFO1lBQ3ZDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDdkIsWUFBWSxFQUFFLDhCQUE4QixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVO1NBQ2pHLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNGO0FBYkQsa0RBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIFBsYWNlaG9sZGVyUGFyYW1zIHtcbiAgY2F0ZWdvcnk6IHN0cmluZztcbiAgY291bnQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW1wb3J0ZWRJbWFnZSB7XG4gIHVybDogc3RyaW5nO1xuICBhbHRUZXh0OiBzdHJpbmc7XG4gIGNhdGVnb3J5OiBzdHJpbmc7XG4gIHNvdXJjZTogc3RyaW5nO1xuICBzb3VyY2VJbmZvPzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgdGFncz86IHN0cmluZ1tdO1xuICB0aHVtYm5haWxVcmw/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFjZWhvbGRlclByb3ZpZGVyIHtcbiAgYXN5bmMgZ2VuZXJhdGUocGFyYW1zOiBQbGFjZWhvbGRlclBhcmFtcyk6IFByb21pc2U8SW1wb3J0ZWRJbWFnZVtdPiB7XG4gICAgY29uc3QgbiA9IHBhcmFtcy5jb3VudCA/PyAzO1xuICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiBuIH0pLm1hcCgoXywgaWR4KSA9PiAoe1xuICAgICAgdXJsOiBgaHR0cHM6Ly9waWNzdW0ucGhvdG9zL3NlZWQvJHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLmNhdGVnb3J5KX0tJHtpZHh9LzEyMDAvODAwYCxcbiAgICAgIGFsdFRleHQ6IGAke3BhcmFtcy5jYXRlZ29yeX0gcGxhY2Vob2xkZXJgLFxuICAgICAgY2F0ZWdvcnk6IHBhcmFtcy5jYXRlZ29yeSxcbiAgICAgIHNvdXJjZTogJ3N0b2NrJyxcbiAgICAgIHNvdXJjZUluZm86IHsgcHJvdmlkZXI6ICdwbGFjZWhvbGRlcicgfSxcbiAgICAgIHRhZ3M6IFtwYXJhbXMuY2F0ZWdvcnldLFxuICAgICAgdGh1bWJuYWlsVXJsOiBgaHR0cHM6Ly9waWNzdW0ucGhvdG9zL3NlZWQvJHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zLmNhdGVnb3J5KX0tJHtpZHh9LzYwMC80MDBgLFxuICAgIH0pKTtcbiAgfVxufVxuXG4iXX0=