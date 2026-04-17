import { http, HttpResponse, type HttpHandler } from 'msw';
import { createMockProperty } from './factories/property';
import { createMockTenant } from './factories/tenant';
import { createMockLease } from './factories/lease';

const API = 'http://localhost:8080';

export const handlers: HttpHandler[] = [
  http.get(`${API}/properties`, () => HttpResponse.json([createMockProperty()])),
  http.get(`${API}/properties/:id`, ({ params }) =>
    HttpResponse.json(createMockProperty({ id: String(params.id) })),
  ),
  http.post(`${API}/properties`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createMockProperty(body as Partial<ReturnType<typeof createMockProperty>>));
  }),
  http.put(`${API}/properties/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      createMockProperty({ id: String(params.id), ...(body as Partial<ReturnType<typeof createMockProperty>>) }),
    );
  }),
  http.delete(`${API}/properties/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/tenants`, () => HttpResponse.json([createMockTenant()])),
  http.get(`${API}/tenants/:id`, ({ params }) =>
    HttpResponse.json(createMockTenant({ id: String(params.id) })),
  ),
  http.post(`${API}/tenants`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createMockTenant(body as Partial<ReturnType<typeof createMockTenant>>));
  }),
  http.put(`${API}/tenants/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      createMockTenant({ id: String(params.id), ...(body as Partial<ReturnType<typeof createMockTenant>>) }),
    );
  }),
  http.delete(`${API}/tenants/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/leases`, () => HttpResponse.json([createMockLease()])),
  http.get(`${API}/leases/:id`, ({ params }) =>
    HttpResponse.json(createMockLease({ id: String(params.id) })),
  ),
  http.post(`${API}/leases`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(createMockLease(body as Partial<ReturnType<typeof createMockLease>>));
  }),
  http.put(`${API}/leases/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      createMockLease({ id: String(params.id), ...(body as Partial<ReturnType<typeof createMockLease>>) }),
    );
  }),
  http.delete(`${API}/leases/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/properties/:propertyId/leases`, ({ params }) =>
    HttpResponse.json([createMockLease({ property_id: String(params.propertyId) })]),
  ),
  http.get(`${API}/tenants/:tenantId/leases`, ({ params }) =>
    HttpResponse.json([createMockLease({ tenant_id: String(params.tenantId) })]),
  ),
];
