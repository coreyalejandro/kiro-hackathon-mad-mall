"use strict";
/**
 * Tests for Smithy model validation and structure
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
describe('Smithy Models', () => {
    const modelsDir = (0, path_1.join)(__dirname, '..', 'models');
    test('should have all required model files', () => {
        const requiredFiles = [
            'main.smithy',
            'common.smithy',
            'errors.smithy',
            'user.smithy',
            'circle.smithy',
            'story.smithy',
            'business.smithy',
            'system.smithy'
        ];
        requiredFiles.forEach(file => {
            const filePath = (0, path_1.join)(modelsDir, file);
            expect((0, fs_1.existsSync)(filePath)).toBe(true);
        });
    });
    test('main.smithy should define MADMallAPI service', () => {
        const mainModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'main.smithy'), 'utf-8');
        expect(mainModel).toContain('service MADMallAPI');
        expect(mainModel).toContain('@restJson1');
        expect(mainModel).toContain('namespace com.madmall.api');
    });
    test('errors.smithy should define standard HTTP error structures', () => {
        const errorsModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'errors.smithy'), 'utf-8');
        const expectedErrors = [
            'ValidationError',
            'UnauthorizedError',
            'ForbiddenError',
            'NotFoundError',
            'ConflictError',
            'TooManyRequestsError',
            'InternalServerError'
        ];
        expectedErrors.forEach(error => {
            expect(errorsModel).toContain(`structure ${error}`);
        });
    });
    test('user.smithy should define user operations', () => {
        const userModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'user.smithy'), 'utf-8');
        const expectedOperations = [
            'CreateUser',
            'GetUser',
            'UpdateUser',
            'DeleteUser',
            'GetUserProfiles'
        ];
        expectedOperations.forEach(operation => {
            expect(userModel).toContain(`operation ${operation}`);
        });
        expect(userModel).toContain('structure User');
        expect(userModel).toContain('structure UserProfile');
        expect(userModel).toContain('structure UserPreferences');
    });
    test('circle.smithy should define circle operations', () => {
        const circleModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'circle.smithy'), 'utf-8');
        const expectedOperations = [
            'CreateCircle',
            'GetCircle',
            'UpdateCircle',
            'DeleteCircle',
            'JoinCircle',
            'LeaveCircle',
            'GetCircleMembers'
        ];
        expectedOperations.forEach(operation => {
            expect(circleModel).toContain(`operation ${operation}`);
        });
        expect(circleModel).toContain('structure Circle');
        expect(circleModel).toContain('structure CircleMember');
        expect(circleModel).toContain('structure CircleSettings');
    });
    test('story.smithy should define story operations', () => {
        const storyModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'story.smithy'), 'utf-8');
        const expectedOperations = [
            'CreateStory',
            'GetStory',
            'UpdateStory',
            'DeleteStory',
            'GetStories',
            'GetFeaturedStories'
        ];
        expectedOperations.forEach(operation => {
            expect(storyModel).toContain(`operation ${operation}`);
        });
        expect(storyModel).toContain('structure Story');
        expect(storyModel).toContain('structure StoryEngagement');
        expect(storyModel).toContain('structure StoryMetadata');
    });
    test('business.smithy should define business and product operations', () => {
        const businessModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'business.smithy'), 'utf-8');
        const expectedOperations = [
            'CreateBusiness',
            'GetBusiness',
            'UpdateBusiness',
            'DeleteBusiness',
            'GetBusinesses',
            'GetFeaturedBusinesses',
            'CreateProduct',
            'GetProduct',
            'UpdateProduct',
            'DeleteProduct',
            'GetProducts',
            'GetFeaturedProducts'
        ];
        expectedOperations.forEach(operation => {
            expect(businessModel).toContain(`operation ${operation}`);
        });
        expect(businessModel).toContain('structure Business');
        expect(businessModel).toContain('structure Product');
        expect(businessModel).toContain('structure BusinessProfile');
    });
    test('system.smithy should define system and content operations', () => {
        const systemModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'system.smithy'), 'utf-8');
        const expectedOperations = [
            'GetHealth',
            'GetStats',
            'GetHighlights',
            'Search',
            'GetRecommendations',
            'InteractWithContent'
        ];
        expectedOperations.forEach(operation => {
            expect(systemModel).toContain(`operation ${operation}`);
        });
        expect(systemModel).toContain('structure CommunityStats');
        expect(systemModel).toContain('structure SearchResponse');
        expect(systemModel).toContain('structure ContentInteractionInput');
    });
    test('common.smithy should define shared types', () => {
        const commonModel = (0, fs_1.readFileSync)((0, path_1.join)(modelsDir, 'common.smithy'), 'utf-8');
        const expectedTypes = [
            'DateTime',
            'Id',
            'Email',
            'Url',
            'PaginationInput',
            'PaginationOutput',
            'InteractionType',
            'ContentType',
            'SearchResultItem'
        ];
        expectedTypes.forEach(type => {
            expect(commonModel).toContain(type);
        });
    });
    test('smithy-build.json should be properly configured', () => {
        const buildConfig = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'smithy-build.json'), 'utf-8'));
        expect(buildConfig.version).toBe('1.0');
        expect(buildConfig.sources).toContain('models');
        expect(buildConfig.plugins).toHaveProperty('typescript-codegen');
        expect(buildConfig.plugins).toHaveProperty('openapi');
        expect(buildConfig.plugins['typescript-codegen'].service).toBe('com.madmall.api#MADMallAPI');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkJBQThDO0FBQzlDLCtCQUE0QjtBQUU1QixRQUFRLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtJQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRWxELElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7UUFDaEQsTUFBTSxhQUFhLEdBQUc7WUFDcEIsYUFBYTtZQUNiLGVBQWU7WUFDZixlQUFlO1lBQ2YsYUFBYTtZQUNiLGVBQWU7WUFDZixjQUFjO1lBQ2QsaUJBQWlCO1lBQ2pCLGVBQWU7U0FDaEIsQ0FBQztRQUVGLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFBLGVBQVUsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtRQUN4RCxNQUFNLFNBQVMsR0FBRyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXhFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFT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QUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxpREFBaUQsRUFBRSxHQUFHLEVBQUU7UUFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDNUIsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FDbEUsQ0FBQztRQUVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDakUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUMvRixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUZXN0cyBmb3IgU21pdGh5IG1vZGVsIHZhbGlkYXRpb24gYW5kIHN0cnVjdHVyZVxuICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYywgZXhpc3RzU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcblxuZGVzY3JpYmUoJ1NtaXRoeSBNb2RlbHMnLCAoKSA9PiB7XG4gIGNvbnN0IG1vZGVsc0RpciA9IGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbW9kZWxzJyk7XG5cbiAgdGVzdCgnc2hvdWxkIGhhdmUgYWxsIHJlcXVpcmVkIG1vZGVsIGZpbGVzJywgKCkgPT4ge1xuICAgIGNvbnN0IHJlcXVpcmVkRmlsZXMgPSBbXG4gICAgICAnbWFpbi5zbWl0aHknLFxuICAgICAgJ2NvbW1vbi5zbWl0aHknLFxuICAgICAgJ2Vycm9ycy5zbWl0aHknLFxuICAgICAgJ3VzZXIuc21pdGh5JyxcbiAgICAgICdjaXJjbGUuc21pdGh5JyxcbiAgICAgICdzdG9yeS5zbWl0aHknLFxuICAgICAgJ2J1c2luZXNzLnNtaXRoeScsXG4gICAgICAnc3lzdGVtLnNtaXRoeSdcbiAgICBdO1xuXG4gICAgcmVxdWlyZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBqb2luKG1vZGVsc0RpciwgZmlsZSk7XG4gICAgICBleHBlY3QoZXhpc3RzU3luYyhmaWxlUGF0aCkpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ21haW4uc21pdGh5IHNob3VsZCBkZWZpbmUgTUFETWFsbEFQSSBzZXJ2aWNlJywgKCkgPT4ge1xuICAgIGNvbnN0IG1haW5Nb2RlbCA9IHJlYWRGaWxlU3luYyhqb2luKG1vZGVsc0RpciwgJ21haW4uc21pdGh5JyksICd1dGYtOCcpO1xuICAgIFxuICAgIGV4cGVjdChtYWluTW9kZWwpLnRvQ29udGFpbignc2VydmljZSBNQURNYWxsQVBJJyk7XG4gICAgZXhwZWN0KG1haW5Nb2RlbCkudG9Db250YWluKCdAcmVzdEpzb24xJyk7XG4gICAgZXhwZWN0KG1haW5Nb2RlbCkudG9Db250YWluKCduYW1lc3BhY2UgY29tLm1hZG1hbGwuYXBpJyk7XG4gIH0pO1xuXG4gIHRlc3QoJ2Vycm9ycy5zbWl0aHkgc2hvdWxkIGRlZmluZSBzdGFuZGFyZCBIVFRQIGVycm9yIHN0cnVjdHVyZXMnLCAoKSA9PiB7XG4gICAgY29uc3QgZXJyb3JzTW9kZWwgPSByZWFkRmlsZVN5bmMoam9pbihtb2RlbHNEaXIsICdlcnJvcnMuc21pdGh5JyksICd1dGYtOCcpO1xuICAgIFxuICAgIGNvbnN0IGV4cGVjdGVkRXJyb3JzID0gW1xuICAgICAgJ1ZhbGlkYXRpb25FcnJvcicsXG4gICAgICAnVW5hdXRob3JpemVkRXJyb3InLFxuICAgICAgJ0ZvcmJpZGRlbkVycm9yJyxcbiAgICAgICdOb3RGb3VuZEVycm9yJyxcbiAgICAgICdDb25mbGljdEVycm9yJyxcbiAgICAgICdUb29NYW55UmVxdWVzdHNFcnJvcicsXG4gICAgICAnSW50ZXJuYWxTZXJ2ZXJFcnJvcidcbiAgICBdO1xuXG4gICAgZXhwZWN0ZWRFcnJvcnMuZm9yRWFjaChlcnJvciA9PiB7XG4gICAgICBleHBlY3QoZXJyb3JzTW9kZWwpLnRvQ29udGFpbihgc3RydWN0dXJlICR7ZXJyb3J9YCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ3VzZXIuc21pdGh5IHNob3VsZCBkZWZpbmUgdXNlciBvcGVyYXRpb25zJywgKCkgPT4ge1xuICAgIGNvbnN0IHVzZXJNb2RlbCA9IHJlYWRGaWxlU3luYyhqb2luKG1vZGVsc0RpciwgJ3VzZXIuc21pdGh5JyksICd1dGYtOCcpO1xuICAgIFxuICAgIGNvbnN0IGV4cGVjdGVkT3BlcmF0aW9ucyA9IFtcbiAgICAgICdDcmVhdGVVc2VyJyxcbiAgICAgICdHZXRVc2VyJyxcbiAgICAgICdVcGRhdGVVc2VyJyxcbiAgICAgICdEZWxldGVVc2VyJyxcbiAgICAgICdHZXRVc2VyUHJvZmlsZXMnXG4gICAgXTtcblxuICAgIGV4cGVjdGVkT3BlcmF0aW9ucy5mb3JFYWNoKG9wZXJhdGlvbiA9PiB7XG4gICAgICBleHBlY3QodXNlck1vZGVsKS50b0NvbnRhaW4oYG9wZXJhdGlvbiAke29wZXJhdGlvbn1gKTtcbiAgICB9KTtcblxuICAgIGV4cGVjdCh1c2VyTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIFVzZXInKTtcbiAgICBleHBlY3QodXNlck1vZGVsKS50b0NvbnRhaW4oJ3N0cnVjdHVyZSBVc2VyUHJvZmlsZScpO1xuICAgIGV4cGVjdCh1c2VyTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIFVzZXJQcmVmZXJlbmNlcycpO1xuICB9KTtcblxuICB0ZXN0KCdjaXJjbGUuc21pdGh5IHNob3VsZCBkZWZpbmUgY2lyY2xlIG9wZXJhdGlvbnMnLCAoKSA9PiB7XG4gICAgY29uc3QgY2lyY2xlTW9kZWwgPSByZWFkRmlsZVN5bmMoam9pbihtb2RlbHNEaXIsICdjaXJjbGUuc21pdGh5JyksICd1dGYtOCcpO1xuICAgIFxuICAgIGNvbnN0IGV4cGVjdGVkT3BlcmF0aW9ucyA9IFtcbiAgICAgICdDcmVhdGVDaXJjbGUnLFxuICAgICAgJ0dldENpcmNsZScsXG4gICAgICAnVXBkYXRlQ2lyY2xlJyxcbiAgICAgICdEZWxldGVDaXJjbGUnLFxuICAgICAgJ0pvaW5DaXJjbGUnLFxuICAgICAgJ0xlYXZlQ2lyY2xlJyxcbiAgICAgICdHZXRDaXJjbGVNZW1iZXJzJ1xuICAgIF07XG5cbiAgICBleHBlY3RlZE9wZXJhdGlvbnMuZm9yRWFjaChvcGVyYXRpb24gPT4ge1xuICAgICAgZXhwZWN0KGNpcmNsZU1vZGVsKS50b0NvbnRhaW4oYG9wZXJhdGlvbiAke29wZXJhdGlvbn1gKTtcbiAgICB9KTtcblxuICAgIGV4cGVjdChjaXJjbGVNb2RlbCkudG9Db250YWluKCdzdHJ1Y3R1cmUgQ2lyY2xlJyk7XG4gICAgZXhwZWN0KGNpcmNsZU1vZGVsKS50b0NvbnRhaW4oJ3N0cnVjdHVyZSBDaXJjbGVNZW1iZXInKTtcbiAgICBleHBlY3QoY2lyY2xlTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIENpcmNsZVNldHRpbmdzJyk7XG4gIH0pO1xuXG4gIHRlc3QoJ3N0b3J5LnNtaXRoeSBzaG91bGQgZGVmaW5lIHN0b3J5IG9wZXJhdGlvbnMnLCAoKSA9PiB7XG4gICAgY29uc3Qgc3RvcnlNb2RlbCA9IHJlYWRGaWxlU3luYyhqb2luKG1vZGVsc0RpciwgJ3N0b3J5LnNtaXRoeScpLCAndXRmLTgnKTtcbiAgICBcbiAgICBjb25zdCBleHBlY3RlZE9wZXJhdGlvbnMgPSBbXG4gICAgICAnQ3JlYXRlU3RvcnknLFxuICAgICAgJ0dldFN0b3J5JyxcbiAgICAgICdVcGRhdGVTdG9yeScsXG4gICAgICAnRGVsZXRlU3RvcnknLFxuICAgICAgJ0dldFN0b3JpZXMnLFxuICAgICAgJ0dldEZlYXR1cmVkU3RvcmllcydcbiAgICBdO1xuXG4gICAgZXhwZWN0ZWRPcGVyYXRpb25zLmZvckVhY2gob3BlcmF0aW9uID0+IHtcbiAgICAgIGV4cGVjdChzdG9yeU1vZGVsKS50b0NvbnRhaW4oYG9wZXJhdGlvbiAke29wZXJhdGlvbn1gKTtcbiAgICB9KTtcblxuICAgIGV4cGVjdChzdG9yeU1vZGVsKS50b0NvbnRhaW4oJ3N0cnVjdHVyZSBTdG9yeScpO1xuICAgIGV4cGVjdChzdG9yeU1vZGVsKS50b0NvbnRhaW4oJ3N0cnVjdHVyZSBTdG9yeUVuZ2FnZW1lbnQnKTtcbiAgICBleHBlY3Qoc3RvcnlNb2RlbCkudG9Db250YWluKCdzdHJ1Y3R1cmUgU3RvcnlNZXRhZGF0YScpO1xuICB9KTtcblxuICB0ZXN0KCdidXNpbmVzcy5zbWl0aHkgc2hvdWxkIGRlZmluZSBidXNpbmVzcyBhbmQgcHJvZHVjdCBvcGVyYXRpb25zJywgKCkgPT4ge1xuICAgIGNvbnN0IGJ1c2luZXNzTW9kZWwgPSByZWFkRmlsZVN5bmMoam9pbihtb2RlbHNEaXIsICdidXNpbmVzcy5zbWl0aHknKSwgJ3V0Zi04Jyk7XG4gICAgXG4gICAgY29uc3QgZXhwZWN0ZWRPcGVyYXRpb25zID0gW1xuICAgICAgJ0NyZWF0ZUJ1c2luZXNzJyxcbiAgICAgICdHZXRCdXNpbmVzcycsXG4gICAgICAnVXBkYXRlQnVzaW5lc3MnLFxuICAgICAgJ0RlbGV0ZUJ1c2luZXNzJyxcbiAgICAgICdHZXRCdXNpbmVzc2VzJyxcbiAgICAgICdHZXRGZWF0dXJlZEJ1c2luZXNzZXMnLFxuICAgICAgJ0NyZWF0ZVByb2R1Y3QnLFxuICAgICAgJ0dldFByb2R1Y3QnLFxuICAgICAgJ1VwZGF0ZVByb2R1Y3QnLFxuICAgICAgJ0RlbGV0ZVByb2R1Y3QnLFxuICAgICAgJ0dldFByb2R1Y3RzJyxcbiAgICAgICdHZXRGZWF0dXJlZFByb2R1Y3RzJ1xuICAgIF07XG5cbiAgICBleHBlY3RlZE9wZXJhdGlvbnMuZm9yRWFjaChvcGVyYXRpb24gPT4ge1xuICAgICAgZXhwZWN0KGJ1c2luZXNzTW9kZWwpLnRvQ29udGFpbihgb3BlcmF0aW9uICR7b3BlcmF0aW9ufWApO1xuICAgIH0pO1xuXG4gICAgZXhwZWN0KGJ1c2luZXNzTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIEJ1c2luZXNzJyk7XG4gICAgZXhwZWN0KGJ1c2luZXNzTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIFByb2R1Y3QnKTtcbiAgICBleHBlY3QoYnVzaW5lc3NNb2RlbCkudG9Db250YWluKCdzdHJ1Y3R1cmUgQnVzaW5lc3NQcm9maWxlJyk7XG4gIH0pO1xuXG4gIHRlc3QoJ3N5c3RlbS5zbWl0aHkgc2hvdWxkIGRlZmluZSBzeXN0ZW0gYW5kIGNvbnRlbnQgb3BlcmF0aW9ucycsICgpID0+IHtcbiAgICBjb25zdCBzeXN0ZW1Nb2RlbCA9IHJlYWRGaWxlU3luYyhqb2luKG1vZGVsc0RpciwgJ3N5c3RlbS5zbWl0aHknKSwgJ3V0Zi04Jyk7XG4gICAgXG4gICAgY29uc3QgZXhwZWN0ZWRPcGVyYXRpb25zID0gW1xuICAgICAgJ0dldEhlYWx0aCcsXG4gICAgICAnR2V0U3RhdHMnLFxuICAgICAgJ0dldEhpZ2hsaWdodHMnLFxuICAgICAgJ1NlYXJjaCcsXG4gICAgICAnR2V0UmVjb21tZW5kYXRpb25zJyxcbiAgICAgICdJbnRlcmFjdFdpdGhDb250ZW50J1xuICAgIF07XG5cbiAgICBleHBlY3RlZE9wZXJhdGlvbnMuZm9yRWFjaChvcGVyYXRpb24gPT4ge1xuICAgICAgZXhwZWN0KHN5c3RlbU1vZGVsKS50b0NvbnRhaW4oYG9wZXJhdGlvbiAke29wZXJhdGlvbn1gKTtcbiAgICB9KTtcblxuICAgIGV4cGVjdChzeXN0ZW1Nb2RlbCkudG9Db250YWluKCdzdHJ1Y3R1cmUgQ29tbXVuaXR5U3RhdHMnKTtcbiAgICBleHBlY3Qoc3lzdGVtTW9kZWwpLnRvQ29udGFpbignc3RydWN0dXJlIFNlYXJjaFJlc3BvbnNlJyk7XG4gICAgZXhwZWN0KHN5c3RlbU1vZGVsKS50b0NvbnRhaW4oJ3N0cnVjdHVyZSBDb250ZW50SW50ZXJhY3Rpb25JbnB1dCcpO1xuICB9KTtcblxuICB0ZXN0KCdjb21tb24uc21pdGh5IHNob3VsZCBkZWZpbmUgc2hhcmVkIHR5cGVzJywgKCkgPT4ge1xuICAgIGNvbnN0IGNvbW1vbk1vZGVsID0gcmVhZEZpbGVTeW5jKGpvaW4obW9kZWxzRGlyLCAnY29tbW9uLnNtaXRoeScpLCAndXRmLTgnKTtcbiAgICBcbiAgICBjb25zdCBleHBlY3RlZFR5cGVzID0gW1xuICAgICAgJ0RhdGVUaW1lJyxcbiAgICAgICdJZCcsXG4gICAgICAnRW1haWwnLFxuICAgICAgJ1VybCcsXG4gICAgICAnUGFnaW5hdGlvbklucHV0JyxcbiAgICAgICdQYWdpbmF0aW9uT3V0cHV0JyxcbiAgICAgICdJbnRlcmFjdGlvblR5cGUnLFxuICAgICAgJ0NvbnRlbnRUeXBlJyxcbiAgICAgICdTZWFyY2hSZXN1bHRJdGVtJ1xuICAgIF07XG5cbiAgICBleHBlY3RlZFR5cGVzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICBleHBlY3QoY29tbW9uTW9kZWwpLnRvQ29udGFpbih0eXBlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnc21pdGh5LWJ1aWxkLmpzb24gc2hvdWxkIGJlIHByb3Blcmx5IGNvbmZpZ3VyZWQnLCAoKSA9PiB7XG4gICAgY29uc3QgYnVpbGRDb25maWcgPSBKU09OLnBhcnNlKFxuICAgICAgcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnc21pdGh5LWJ1aWxkLmpzb24nKSwgJ3V0Zi04JylcbiAgICApO1xuXG4gICAgZXhwZWN0KGJ1aWxkQ29uZmlnLnZlcnNpb24pLnRvQmUoJzEuMCcpO1xuICAgIGV4cGVjdChidWlsZENvbmZpZy5zb3VyY2VzKS50b0NvbnRhaW4oJ21vZGVscycpO1xuICAgIGV4cGVjdChidWlsZENvbmZpZy5wbHVnaW5zKS50b0hhdmVQcm9wZXJ0eSgndHlwZXNjcmlwdC1jb2RlZ2VuJyk7XG4gICAgZXhwZWN0KGJ1aWxkQ29uZmlnLnBsdWdpbnMpLnRvSGF2ZVByb3BlcnR5KCdvcGVuYXBpJyk7XG4gICAgZXhwZWN0KGJ1aWxkQ29uZmlnLnBsdWdpbnNbJ3R5cGVzY3JpcHQtY29kZWdlbiddLnNlcnZpY2UpLnRvQmUoJ2NvbS5tYWRtYWxsLmFwaSNNQURNYWxsQVBJJyk7XG4gIH0pO1xufSk7Il19