import { supabase, SUPABASE_URL } from '../lib/supabase';
import {
  CleaningService,
  IncidentReport,
  KitItem,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  TransactionRecord,
  WarehouseMovement,
  Quotation
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_INCIDENTS,
  INITIAL_KIT,
  INITIAL_SUPPLIES_INVENTORY,
  INITIAL_3DAY_REPORTS,
  INITIAL_SUPPLY_REQUESTS,
  INITIAL_CLIENTS,
  INITIAL_EMPLOYEES,
  INITIAL_FINANCES,
  INITIAL_WAREHOUSE_MOVEMENTS,
  INITIAL_QUOTATIONS
} from '../data/mockData';

export const supabaseService = {
  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.from('clients').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return {
            success: false,
            message: 'Conexión a Supabase exitosa, pero las tablas aún no han sido creadas. Ejecuta el script SQL en el Editor SQL de Supabase.'
          };
        }
        return { success: false, message: `Error de Supabase: ${error.message}` };
      }
      return { success: true, message: 'Conectado exitosamente a Supabase (' + SUPABASE_URL + ')' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error de red o conexión al servicio Supabase' };
    }
  },

  // Seed all initial data to Supabase
  async seedAllData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Clients
      const clientsData = INITIAL_CLIENTS.map((c) => ({
        id: c.id,
        name: c.name,
        contact_person: c.contactPerson,
        email: c.email,
        phone: c.phone,
        address: c.address,
        contract_frequency: c.contractFrequency,
        auto_3day_report: c.auto3DayReport,
        monthly_fee: c.monthlyFee,
        assigned_employee_id: c.assignedEmployeeId || null,
        assigned_employee_name: c.assignedEmployeeName || null,
        assigned_employee_phone: c.assignedEmployeePhone || null,
        assigned_employee_role: c.assignedEmployeeRole || null,
        notes: c.notes || null
      }));
      await supabase.from('clients').upsert(clientsData);

      // 2. Employees
      const employeesData = INITIAL_EMPLOYEES.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        phone: e.phone,
        email: e.email,
        assigned_zone: e.assignedZone,
        status: e.status,
        services_completed_this_month: e.servicesCompletedThisMonth
      }));
      await supabase.from('employees').upsert(employeesData);

      // 3. Services
      const servicesData = INITIAL_SERVICES.map((s) => ({
        id: s.id,
        client_name: s.clientName,
        client_address: s.clientAddress,
        date: s.date,
        time_slot: s.timeSlot,
        status: s.status,
        operative_id: s.operativeId,
        operative_name: s.operativeName,
        special_instructions: s.specialInstructions,
        tasks: s.tasks,
        evidences: s.evidences,
        approved_by_admin: s.approvedByAdmin || false,
        total_cost: s.totalCost,
        client_signature: s.clientSignature || null
      }));
      await supabase.from('services').upsert(servicesData);

      // 4. Incidents
      const incidentsData = INITIAL_INCIDENTS.map((i) => ({
        id: i.id,
        service_id: i.serviceId,
        client_name: i.clientName,
        location: i.location,
        operative_name: i.operativeName,
        date: i.date,
        time: i.time,
        type: i.type,
        title: i.title,
        description: i.description,
        photo_url: i.photoUrl || null,
        status: i.status,
        admin_resolution: i.adminResolution || null,
        origin: i.origin || 'operativo',
        priority: i.priority || 'normal',
        assigned_employee_id: i.assignedEmployeeId || null,
        assigned_employee_name: i.assignedEmployeeName || null,
        resolution_photo_url: i.resolutionPhotoUrl || null,
        resolution_notes: i.resolutionNotes || i.adminResolution || null,
        resolved_at: i.resolvedAt || null,
        resolved_by: i.resolvedBy || null,
        resolved_by_role: i.resolvedByRole || null,
        client_rating: i.clientRating || null
      }));
      await supabase.from('incidents').upsert(incidentsData);

      // 5. Supplies
      const suppliesData = INITIAL_SUPPLIES_INVENTORY.map((sp) => ({
        id: sp.id,
        name: sp.name,
        category: sp.category,
        current_stock: sp.currentStock,
        unit: sp.unit,
        minimum_stock: sp.minimumStock,
        cost_per_unit: sp.costPerUnit
      }));
      await supabase.from('supplies').upsert(suppliesData);

      // 6. Kit Items
      const kitData = INITIAL_KIT.map((k) => ({
        id: k.id,
        name: k.name,
        unit: k.unit,
        quantity_assigned: k.quantityAssigned,
        checked_in: k.checkedIn,
        status: k.status,
        notes: k.notes || null
      }));
      await supabase.from('kit_items').upsert(kitData);

      // 7. Warehouse movements
      const movementsData = INITIAL_WAREHOUSE_MOVEMENTS.map((wm) => ({
        id: wm.id,
        date: wm.date,
        time: wm.time,
        supply_id: wm.supplyId,
        supply_name: wm.supplyName,
        type: wm.type,
        quantity: wm.quantity,
        unit: wm.unit,
        operative_name: wm.operativeName,
        reason: wm.reason,
        service_or_location: wm.serviceOrLocation || null
      }));
      await supabase.from('warehouse_movements').upsert(movementsData);

      // 8. Cycle reports
      const cycleData = INITIAL_3DAY_REPORTS.map((cr) => ({
        id: cr.id,
        client_id: cr.clientId,
        client_name: cr.clientName,
        period_start: cr.periodStart,
        period_end: cr.periodEnd,
        cycle_number: cr.cycleNumber,
        generated_date: cr.generatedDate,
        status: cr.status,
        items: cr.items
      }));
      await supabase.from('cycle_reports').upsert(cycleData);

      // 9. Supply requests
      const requestData = INITIAL_SUPPLY_REQUESTS.map((sr) => ({
        id: sr.id,
        client_id: sr.clientId,
        client_name: sr.clientName,
        request_date: sr.requestDate,
        cycle_report_id: sr.cycleReportId || null,
        status: sr.status,
        items: sr.items,
        notes: sr.notes || null,
        total_estimated_cost: sr.totalEstimatedCost
      }));
      await supabase.from('supply_requests').upsert(requestData);

      // 10. Finances
      const financeData = INITIAL_FINANCES.map((f) => ({
        id: f.id,
        date: f.date,
        type: f.type,
        category: f.category,
        concept: f.concept,
        client_or_vendor: f.clientOrVendor,
        amount: f.amount,
        status: f.status
      }));
      await supabase.from('transactions').upsert(financeData);

      // 11. Quotations
      const quotesData = INITIAL_QUOTATIONS.map((q) => ({
        id: q.id,
        folio: q.folio,
        date: q.date,
        valid_until: q.validUntil,
        company_name: q.companyName,
        company_tax_id: q.companyTaxId,
        company_phone: q.companyPhone,
        company_email: q.companyEmail,
        company_address: q.companyAddress,
        client_name: q.clientName,
        client_contact: q.clientContact,
        client_tax_id: q.clientTaxId || null,
        client_phone: q.clientPhone,
        client_email: q.clientEmail,
        client_address: q.clientAddress,
        items: q.items,
        subtotal: q.subtotal,
        tax_rate: q.taxRate,
        tax_amount: q.taxAmount,
        total: q.total,
        service_conditions: q.serviceConditions,
        payment_terms: q.paymentTerms,
        delivery_time: q.deliveryTime,
        notes: q.notes || null,
        status: q.status
      }));
      await supabase.from('quotations').upsert(quotesData);

      return { success: true, message: 'Datos iniciales sembrados con éxito en Supabase.' };
    } catch (err: any) {
      return { success: false, message: `Error al sembrar datos: ${err.message}` };
    }
  },

  // Fetch all data from Supabase
  async fetchAll() {
    const [
      clientsRes,
      employeesRes,
      servicesRes,
      incidentsRes,
      suppliesRes,
      kitRes,
      movementsRes,
      cycleRes,
      requestsRes,
      financesRes,
      quotationsRes
    ] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('employees').select('*').order('name'),
      supabase.from('services').select('*').order('date', { ascending: false }),
      supabase.from('incidents').select('*').order('date', { ascending: false }),
      supabase.from('supplies').select('*').order('name'),
      supabase.from('kit_items').select('*'),
      supabase.from('warehouse_movements').select('*').order('date', { ascending: false }),
      supabase.from('cycle_reports').select('*').order('generated_date', { ascending: false }),
      supabase.from('supply_requests').select('*').order('request_date', { ascending: false }),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('quotations').select('*').order('date', { ascending: false })
    ]);

    return {
      clients: clientsRes.data
        ? clientsRes.data.map((c: any): ClientProfile => ({
            id: c.id,
            name: c.name,
            contactPerson: c.contact_person,
            email: c.email,
            phone: c.phone,
            address: c.address,
            contractFrequency: c.contract_frequency,
            auto3DayReport: c.auto_3day_report,
            monthlyFee: Number(c.monthly_fee),
            assignedEmployeeId: c.assigned_employee_id,
            assignedEmployeeName: c.assigned_employee_name,
            assignedEmployeePhone: c.assigned_employee_phone,
            assignedEmployeeRole: c.assigned_employee_role,
            notes: c.notes
          }))
        : null,
      employees: employeesRes.data
        ? employeesRes.data.map((e: any): EmployeeProfile => ({
            id: e.id,
            name: e.name,
            role: e.role,
            phone: e.phone,
            email: e.email,
            assignedZone: e.assigned_zone,
            status: e.status,
            servicesCompletedThisMonth: e.services_completed_this_month
          }))
        : null,
      services: servicesRes.data
        ? servicesRes.data.map((s: any): CleaningService => ({
            id: s.id,
            clientName: s.client_name,
            clientAddress: s.client_address,
            date: s.date,
            timeSlot: s.time_slot,
            status: s.status,
            operativeId: s.operative_id,
            operativeName: s.operative_name,
            specialInstructions: s.special_instructions,
            tasks: s.tasks || [],
            evidences: s.evidences || [],
            approvedByAdmin: s.approved_by_admin,
            totalCost: Number(s.total_cost),
            clientSignature: s.client_signature || undefined
          }))
        : null,
      incidents: incidentsRes.data
        ? incidentsRes.data.map((i: any): IncidentReport => ({
            id: i.id,
            serviceId: i.service_id,
            clientName: i.client_name,
            location: i.location,
            operativeName: i.operative_name,
            date: i.date,
            time: i.time,
            type: i.type,
            title: i.title,
            description: i.description,
            photoUrl: i.photo_url,
            status: i.status,
            adminResolution: i.admin_resolution,
            origin: i.origin || 'operativo',
            priority: i.priority || 'normal',
            assignedEmployeeId: i.assigned_employee_id,
            assignedEmployeeName: i.assigned_employee_name,
            resolutionPhotoUrl: i.resolution_photo_url,
            resolutionNotes: i.resolution_notes,
            resolvedAt: i.resolved_at,
            resolvedBy: i.resolved_by,
            resolvedByRole: i.resolved_by_role,
            clientRating: i.client_rating ? Number(i.client_rating) : undefined
          }))
        : null,
      supplies: suppliesRes.data
        ? suppliesRes.data.map((sp: any): SupplyItem => ({
            id: sp.id,
            name: sp.name,
            category: sp.category,
            currentStock: Number(sp.current_stock),
            unit: sp.unit,
            minimumStock: Number(sp.minimum_stock),
            costPerUnit: Number(sp.cost_per_unit)
          }))
        : null,
      kitItems: kitRes.data
        ? kitRes.data.map((k: any): KitItem => ({
            id: k.id,
            name: k.name,
            unit: k.unit,
            quantityAssigned: Number(k.quantity_assigned),
            checkedIn: k.checked_in,
            status: k.status,
            notes: k.notes
          }))
        : null,
      warehouseMovements: movementsRes.data
        ? movementsRes.data.map((wm: any): WarehouseMovement => ({
            id: wm.id,
            date: wm.date,
            time: wm.time,
            supplyId: wm.supply_id,
            supplyName: wm.supply_name,
            type: wm.type,
            quantity: Number(wm.quantity),
            unit: wm.unit,
            operativeName: wm.operative_name,
            reason: wm.reason,
            serviceOrLocation: wm.service_or_location
          }))
        : null,
      cycleReports: cycleRes.data
        ? cycleRes.data.map((cr: any): Cycle3DayReport => ({
            id: cr.id,
            clientId: cr.client_id,
            clientName: cr.client_name,
            periodStart: cr.period_start,
            periodEnd: cr.period_end,
            cycleNumber: cr.cycle_number,
            generatedDate: cr.generated_date,
            status: cr.status,
            items: cr.items || []
          }))
        : null,
      supplyRequests: requestsRes.data
        ? requestsRes.data.map((sr: any): SupplyRequest => ({
            id: sr.id,
            clientId: sr.client_id,
            clientName: sr.client_name,
            requestDate: sr.request_date,
            cycleReportId: sr.cycle_report_id,
            status: sr.status,
            items: sr.items || [],
            notes: sr.notes,
            totalEstimatedCost: Number(sr.total_estimated_cost)
          }))
        : null,
      finances: financesRes.data
        ? financesRes.data.map((f: any): TransactionRecord => ({
            id: f.id,
            date: f.date,
            type: f.type,
            category: f.category,
            concept: f.concept,
            clientOrVendor: f.client_or_vendor,
            amount: Number(f.amount),
            status: f.status
          }))
        : null,
      quotations: quotationsRes.data
        ? quotationsRes.data.map((q: any): Quotation => ({
            id: q.id,
            folio: q.folio,
            date: q.date,
            validUntil: q.valid_until,
            companyName: q.company_name,
            companyTaxId: q.company_tax_id,
            companyPhone: q.company_phone,
            companyEmail: q.company_email,
            companyAddress: q.company_address,
            clientName: q.client_name,
            clientContact: q.client_contact,
            clientTaxId: q.client_tax_id,
            clientPhone: q.client_phone,
            clientEmail: q.client_email,
            clientAddress: q.client_address,
            items: q.items || [],
            subtotal: Number(q.subtotal),
            taxRate: Number(q.tax_rate),
            taxAmount: Number(q.tax_amount),
            total: Number(q.total),
            serviceConditions: q.service_conditions,
            paymentTerms: q.payment_terms,
            deliveryTime: q.delivery_time,
            notes: q.notes,
            status: q.status
          }))
        : null
    };
  },

  // Real-time listener helper
  subscribeToChanges(onUpdate: () => void) {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
