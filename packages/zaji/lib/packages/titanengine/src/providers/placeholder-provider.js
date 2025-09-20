"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderProvider = void 0;
class PlaceholderProvider {
    async generate(params) {
        const n = params.count ?? 3;
        return Array.from({ length: n }).map((_, idx) => {
            const seed = `${encodeURIComponent(params.category)}-${idx}`;
            return {
                url: `https://placehold.co/1200x800/000000/FFFFFF.png?text=Black+Woman+${idx + 1}`,
                altText: `Culturally appropriate placeholder for ${params.category}`,
                category: params.category,
                source: 'placeholder',
                sourceInfo: { provider: 'placeholder', seed },
                tags: [params.category, 'black_woman', 'placeholder'],
                thumbnailUrl: `https://placehold.co/600x400/000000/FFFFFF.png?text=Black+Woman+${idx + 1}`,
            };
        });
    }
}
exports.PlaceholderProvider = PlaceholderProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhY2Vob2xkZXItcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3BsYWNlaG9sZGVyLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWVBLE1BQWEsbUJBQW1CO0lBQzlCLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBeUI7UUFDdEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzlDLE1BQU0sSUFBSSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzdELE9BQU87Z0JBQ0wsR0FBRyxFQUFFLG9FQUFvRSxHQUFHLEdBQUcsQ0FBQyxFQUFFO2dCQUNsRixPQUFPLEVBQUUsMENBQTBDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ3BFLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtnQkFDekIsTUFBTSxFQUFFLGFBQWE7Z0JBQ3JCLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFO2dCQUM3QyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUM7Z0JBQ3JELFlBQVksRUFBRSxtRUFBbUUsR0FBRyxHQUFHLENBQUMsRUFBRTthQUMzRixDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoQkQsa0RBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGludGVyZmFjZSBQbGFjZWhvbGRlclBhcmFtcyB7XG4gIGNhdGVnb3J5OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEltcG9ydGVkSW1hZ2Uge1xuICB1cmw6IHN0cmluZztcbiAgYWx0VGV4dDogc3RyaW5nO1xuICBjYXRlZ29yeTogc3RyaW5nO1xuICBzb3VyY2U6IHN0cmluZztcbiAgc291cmNlSW5mbz86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gIHRhZ3M/OiBzdHJpbmdbXTtcbiAgdGh1bWJuYWlsVXJsPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhY2Vob2xkZXJQcm92aWRlciB7XG4gIGFzeW5jIGdlbmVyYXRlKHBhcmFtczogUGxhY2Vob2xkZXJQYXJhbXMpOiBQcm9taXNlPEltcG9ydGVkSW1hZ2VbXT4ge1xuICAgIGNvbnN0IG4gPSBwYXJhbXMuY291bnQgPz8gMztcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9KS5tYXAoKF8sIGlkeCkgPT4ge1xuICAgICAgY29uc3Qgc2VlZCA9IGAke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuY2F0ZWdvcnkpfS0ke2lkeH1gO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly9wbGFjZWhvbGQuY28vMTIwMHg4MDAvMDAwMDAwL0ZGRkZGRi5wbmc/dGV4dD1CbGFjaytXb21hbiske2lkeCArIDF9YCxcbiAgICAgICAgYWx0VGV4dDogYEN1bHR1cmFsbHkgYXBwcm9wcmlhdGUgcGxhY2Vob2xkZXIgZm9yICR7cGFyYW1zLmNhdGVnb3J5fWAsXG4gICAgICAgIGNhdGVnb3J5OiBwYXJhbXMuY2F0ZWdvcnksXG4gICAgICAgIHNvdXJjZTogJ3BsYWNlaG9sZGVyJyxcbiAgICAgICAgc291cmNlSW5mbzogeyBwcm92aWRlcjogJ3BsYWNlaG9sZGVyJywgc2VlZCB9LFxuICAgICAgICB0YWdzOiBbcGFyYW1zLmNhdGVnb3J5LCAnYmxhY2tfd29tYW4nLCAncGxhY2Vob2xkZXInXSxcbiAgICAgICAgdGh1bWJuYWlsVXJsOiBgaHR0cHM6Ly9wbGFjZWhvbGQuY28vNjAweDQwMC8wMDAwMDAvRkZGRkZGLnBuZz90ZXh0PUJsYWNrK1dvbWFuKyR7aWR4ICsgMX1gLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG4iXX0=