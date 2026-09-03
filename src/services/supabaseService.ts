import { supabase, SUPABASE_URL } from '../lib/supabase';
export { supabase, SUPABASE_URL };
import {
  CleaningService,
  IncidentReport,
  KitItem,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  AppUser,
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
  INITIAL_USERS,
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

      // 2. Employees & Staff
      const employeesData = INITIAL_EMPLOYEES.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        phone: e.phone,
        email: e.email,
        assigned_zone: e.assignedZone,
        status: e.status,
        services_completed_this_month: e.servicesCompletedThisMonth,
        username: e.username || null,
        password: e.password || null,
        avatar_url: e.avatarUrl || null,
        notes: e.notes || null,
        job_title: e.jobTitle || e.role || null
      }));
      await supabase.from('employees').upsert(employeesData);

      // 2.1 App Users (Authentication & Roles)
      try {
        const usersData = INITIAL_USERS.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username,
          password: u.password,
          role: u.role,
          job_title: u.jobTitle || null,
          phone: u.phone,
          assigned_zone: u.assignedZone || null,
          avatar_url: u.avatarUrl || null,
          status: u.status,
          notes: u.notes || null
        }));
        await supabase.from('app_users').upsert(usersData);
      } catch (userErr) {
        console.warn('Tabla app_users aún no creada o error al sembrar usuarios:', userErr);
      }

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

  // Clear data from Supabase
  async clearAllData(preserveCatalog: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const operationalTables = [
        'services',
        'incidents',
        'warehouse_movements',
        'cycle_reports',
        'supply_requests',
        'transactions',
        'quotations'
      ];
      const catalogTables = preserveCatalog ? [] : ['kit_items', 'supplies', 'employees', 'clients', 'app_users'];
      const allTables = [...operationalTables, ...catalogTables];

      for (const table of allTables) {
        try {
          await supabase.from(table).delete().neq('id', '___force_delete_all_rows___');
        } catch (tableErr) {
          // Table may not exist yet, continue
        }
      }

      return {
        success: true,
        message: preserveCatalog
          ? 'Registros operativos de prueba eliminados (se preservó el catálogo de clientes, empleados e insumos).'
          : 'Todas las tablas de Supabase han sido vaciadas exitosamente. La base de datos está lista para producción.'
      };
    } catch (err: any) {
      return { success: false, message: `Error al limpiar datos: ${err.message}` };
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
      quotationsRes,
      usersRes
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
      supabase.from('quotations').select('*').order('date', { ascending: false }),
      supabase.from('app_users').select('*').order('name')
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
            servicesCompletedThisMonth: e.services_completed_this_month,
            username: e.username || undefined,
            password: e.password || undefined,
            avatarUrl: e.avatar_url || undefined,
            notes: e.notes || undefined,
            jobTitle: e.job_title || undefined
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
        : null,
      users: usersRes?.data
        ? usersRes.data.map((u: any): AppUser => ({
            id: u.id,
            name: u.name,
            email: u.email,
            username: u.username,
            password: u.password,
            role: u.role,
            jobTitle: u.job_title || undefined,
            phone: u.phone,
            assignedZone: u.assigned_zone || undefined,
            avatarUrl: u.avatar_url || undefined,
            status: u.status || 'activo',
            notes: u.notes || undefined,
            createdAt: u.created_at || undefined
          }))
        : null
    };
  },

  // Save or update an employee
  async saveEmployee(emp: EmployeeProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanEmail =
        emp.email && emp.email.trim() !== ''
          ? emp.email.trim()
          : `${(emp.username || emp.name).toLowerCase().replace(/[^a-z0-9]/g, '')}@serssoluciones.mx`;

      const payload = {
        id: emp.id,
        name: emp.name,
        role: emp.role || emp.jobTitle || 'Técnico Especialista',
        phone: emp.phone || '+52 55 1234 5678',
        email: cleanEmail,
        assigned_zone: emp.assignedZone || 'Zona General',
        status: emp.status || 'activo',
        services_completed_this_month: emp.servicesCompletedThisMonth || 0,
        username: emp.username || null,
        password: emp.password || null,
        avatar_url: emp.avatarUrl || null,
        notes: emp.notes || null,
        job_title: emp.jobTitle || emp.role || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('employees').upsert(payload);
      if (error) {
        console.error('Error in employees.upsert:', error);
        throw error;
      }

      // Also upsert to app_users if has username and password
      if (emp.username && emp.password) {
        try {
          const userPayload = {
            id: emp.id.startsWith('USR-') ? emp.id : `USR-${emp.id}`,
            name: emp.name,
            email: cleanEmail,
            username: emp.username,
            password: emp.password,
            role: emp.role?.toLowerCase().includes('admin') ? 'admin' : 'operative',
            job_title: emp.jobTitle || emp.role,
            phone: emp.phone || '+52 55 1234 5678',
            assigned_zone: emp.assignedZone || 'Zona General',
            avatar_url: emp.avatarUrl || null,
            status: emp.status || 'activo',
            notes: emp.notes || null,
            updated_at: new Date().toISOString()
          };
          const { error: uErr } = await supabase.from('app_users').upsert(userPayload);
          if (uErr) {
            console.warn('Could not sync to app_users table:', uErr);
          }
        } catch (uErr) {
          console.warn('Could not sync to app_users table:', uErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving employee to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save or update an AppUser directly
  async saveAppUser(user: AppUser): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password,
        role: user.role,
        job_title: user.jobTitle || null,
        phone: user.phone,
        assigned_zone: user.assignedZone || null,
        avatar_url: user.avatarUrl || null,
        status: user.status,
        notes: user.notes || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('app_users').upsert(payload);
      if (error) throw error;

      // Also sync to employees if operative or admin
      if (user.role === 'operative' || user.role === 'admin') {
        try {
          const empPayload = {
            id: user.id.replace('USR-', 'EMP-'),
            name: user.name,
            role: user.jobTitle || (user.role === 'admin' ? 'Administrador' : 'Técnico Especialista'),
            phone: user.phone,
            email: user.email,
            assigned_zone: user.assignedZone || 'Zona General',
            status: user.status,
            services_completed_this_month: 0,
            username: user.username,
            password: user.password,
            avatar_url: user.avatarUrl,
            notes: user.notes,
            job_title: user.jobTitle,
            updated_at: new Date().toISOString()
          };
          await supabase.from('employees').upsert(empPayload);
        } catch (eErr) {
          console.warn('Could not sync to employees table:', eErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving app_user to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Update profile data (photo, name, password, etc)
  async updateUserProfile(userId: string, data: Partial<AppUser>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined && data.email.trim() !== '') updateData.email = data.email.trim();
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.password !== undefined && data.password.trim() !== '') updateData.password = data.password.trim();
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle;

      // 1. Update in app_users
      let userUpdated = false;
      const { data: uRes1, error: uErr1 } = await supabase
        .from('app_users')
        .update(updateData)
        .eq('id', userId)
        .select();

      if (uRes1 && uRes1.length > 0) {
        userUpdated = true;
      } else if (data.username || data.email) {
        const orConditions = [];
        if (data.username) orConditions.push(`username.eq.${data.username}`);
        if (data.email) orConditions.push(`email.eq.${data.email}`);
        if (orConditions.length > 0) {
          const { data: uRes2 } = await supabase
            .from('app_users')
            .update(updateData)
            .or(orConditions.join(','))
            .select();
          if (uRes2 && uRes2.length > 0) userUpdated = true;
        }
      }

      // If user row wasn't present in app_users yet, insert it
      if (!userUpdated && (data.username || userId)) {
        await supabase.from('app_users').upsert({
          id: userId.startsWith('USR-') ? userId : `USR-${userId}`,
          name: data.name || 'Harold Anguiano Morales',
          email: data.email || (data.username ? `${data.username}@serssoluciones.mx` : 'haroldo90@hotmail.com'),
          username: data.username || 'haroldo90',
          password: data.password || 'Chevropar#1970',
          role: data.role || 'admin',
          avatar_url: data.avatarUrl || null,
          job_title: data.jobTitle || 'Director General / Administrador',
          phone: data.phone || '+52 55 1234 5678',
          status: 'activo',
          updated_at: new Date().toISOString()
        });
      }

      // 2. Also update in employees table (for photos, name, phone, etc.)
      const empUpdateData: any = { updated_at: new Date().toISOString() };
      if (data.name !== undefined) empUpdateData.name = data.name;
      if (data.email !== undefined && data.email.trim() !== '') empUpdateData.email = data.email.trim();
      if (data.phone !== undefined) empUpdateData.phone = data.phone;
      if (data.password !== undefined && data.password.trim() !== '') empUpdateData.password = data.password.trim();
      if (data.avatarUrl !== undefined) empUpdateData.avatar_url = data.avatarUrl;
      if (data.notes !== undefined) empUpdateData.notes = data.notes;
      if (data.jobTitle !== undefined) empUpdateData.job_title = data.jobTitle;

      const empOrConditions = [`id.eq.${userId}`];
      if (userId.startsWith('USR-')) {
        empOrConditions.push(`id.eq.${userId.replace('USR-', 'EMP-')}`);
      }
      if (data.username) {
        empOrConditions.push(`username.eq.${data.username}`);
      }
      if (data.email) {
        empOrConditions.push(`email.eq.${data.email}`);
      }

      const { error: eErr } = await supabase
        .from('employees')
        .update(empUpdateData)
        .or(empOrConditions.join(','));

      if (eErr) {
        console.warn('employees table update warning:', eErr);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error updating user profile in Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete an employee from employees table and app_users
  async deleteEmployee(employeeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase.from('employees').delete().eq('id', employeeId);
      const usrId = employeeId.startsWith('USR-') ? employeeId : `USR-${employeeId}`;
      await supabase.from('app_users').delete().or(`id.eq.${employeeId},id.eq.${usrId}`);
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting employee from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save or update a client
  async saveClient(client: ClientProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanEmail =
        client.email && client.email.trim() !== ''
          ? client.email.trim()
          : `${(client.username || client.name).toLowerCase().replace(/[^a-z0-9]/g, '')}@serssoluciones.mx`;

      const payload = {
        id: client.id,
        name: client.name,
        contact_person: client.contactPerson || 'Responsable de Sede',
        email: cleanEmail,
        phone: client.phone || '+52 55 1234 5678',
        address: client.address || 'Ciudad de México',
        contract_frequency: client.contractFrequency || 'Lunes a Sábado',
        auto_3day_report: client.auto3DayReport ?? true,
        monthly_fee: client.monthlyFee || 0,
        assigned_employee_id: client.assignedEmployeeId || null,
        assigned_employee_name: client.assignedEmployeeName || null,
        assigned_employee_phone: client.assignedEmployeePhone || null,
        assigned_employee_role: client.assignedEmployeeRole || null,
        notes: client.notes || null,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('clients').upsert(payload);
      if (error) {
        console.error('Error in clients.upsert:', error);
        throw error;
      }

      // Also upsert to app_users if client has credentials
      if (client.username && client.password) {
        try {
          const userPayload = {
            id: client.id.startsWith('USR-') ? client.id : `USR-${client.id}`,
            name: client.contactPerson || client.name,
            email: cleanEmail,
            username: client.username,
            password: client.password,
            role: 'client',
            job_title: 'Representante de Sede',
            phone: client.phone || '+52 55 1234 5678',
            assigned_zone: client.name,
            status: (client as any).status || 'activo',
            notes: `Portal de Cliente: ${client.name}`,
            updated_at: new Date().toISOString()
          };
          const { error: uErr } = await supabase.from('app_users').upsert(userPayload);
          if (uErr) {
            console.warn('Could not sync client to app_users:', uErr);
          }
        } catch (uErr) {
          console.warn('Could not sync client to app_users:', uErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error saving client to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete a client
  async deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting client from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save or update a service
  async saveService(service: CleaningService): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: service.id,
        client_name: service.clientName,
        client_address: service.clientAddress,
        date: service.date,
        time_slot: service.timeSlot,
        status: service.status,
        operative_id: service.operativeId,
        operative_name: service.operativeName,
        special_instructions: service.specialInstructions || '',
        tasks: service.tasks || [],
        evidences: service.evidences || [],
        approved_by_admin: service.approvedByAdmin || false,
        total_cost: service.totalCost || 0,
        client_signature: service.clientSignature || null
      };
      const { error } = await supabase.from('services').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving service to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete a service
  async deleteService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting service from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save or update an incident
  async saveIncident(incident: IncidentReport): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: incident.id,
        service_id: incident.serviceId,
        client_name: incident.clientName,
        location: incident.location,
        operative_name: incident.operativeName,
        date: incident.date,
        time: incident.time,
        type: incident.type,
        title: incident.title,
        description: incident.description,
        photo_url: incident.photoUrl || null,
        status: incident.status,
        admin_resolution: incident.adminResolution || null,
        origin: incident.origin || 'operativo',
        priority: incident.priority || 'normal',
        assigned_employee_id: incident.assignedEmployeeId || null,
        assigned_employee_name: incident.assignedEmployeeName || null,
        resolution_photo_url: incident.resolutionPhotoUrl || null,
        resolution_notes: incident.resolutionNotes || incident.adminResolution || null,
        resolved_at: incident.resolvedAt || null,
        resolved_by: incident.resolvedBy || null,
        resolved_by_role: incident.resolvedByRole || null,
        client_rating: incident.clientRating || null
      };
      const { error } = await supabase.from('incidents').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving incident to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete an incident
  async deleteIncident(incidentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('incidents').delete().eq('id', incidentId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting incident from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save or update a supply item
  async saveSupply(supply: SupplyItem): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: supply.id,
        name: supply.name,
        category: supply.category,
        current_stock: supply.currentStock,
        unit: supply.unit,
        minimum_stock: supply.minimumStock,
        cost_per_unit: supply.costPerUnit
      };
      const { error } = await supabase.from('supplies').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving supply to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete a supply item
  async deleteSupply(supplyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('supplies').delete().eq('id', supplyId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting supply from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete quotation
  async deleteQuotation(quotationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('quotations').delete().eq('id', quotationId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting quotation from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save quotation
  async saveQuotation(quote: Quotation): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: quote.id,
        folio: quote.folio,
        date: quote.date,
        valid_until: quote.validUntil,
        company_name: quote.companyName,
        company_tax_id: quote.companyTaxId,
        company_phone: quote.companyPhone,
        company_email: quote.companyEmail,
        company_address: quote.companyAddress,
        client_name: quote.clientName,
        client_contact: quote.clientContact,
        client_tax_id: quote.clientTaxId,
        client_phone: quote.clientPhone,
        client_email: quote.clientEmail,
        client_address: quote.clientAddress,
        items: quote.items || [],
        subtotal: quote.subtotal,
        tax_rate: quote.taxRate,
        tax_amount: quote.taxAmount,
        total: quote.total,
        service_conditions: quote.serviceConditions,
        payment_terms: quote.paymentTerms,
        delivery_time: quote.deliveryTime,
        notes: quote.notes,
        status: quote.status
      };
      const { error } = await supabase.from('quotations').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving quotation to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete finance transaction
  async deleteTransaction(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting transaction from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save finance transaction
  async saveTransaction(f: TransactionRecord): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: f.id,
        date: f.date,
        type: f.type,
        category: f.category,
        concept: f.concept,
        client_or_vendor: f.clientOrVendor,
        amount: f.amount,
        status: f.status
      };
      const { error } = await supabase.from('transactions').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving transaction to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save warehouse movement
  async saveWarehouseMovement(wm: WarehouseMovement): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
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
      };
      const { error } = await supabase.from('warehouse_movements').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving warehouse movement to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete warehouse movement
  async deleteWarehouseMovement(movementId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('warehouse_movements').delete().eq('id', movementId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting warehouse movement from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save kit item
  async saveKitItem(k: KitItem): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: k.id,
        name: k.name,
        unit: k.unit,
        quantity_assigned: k.quantityAssigned,
        checked_in: k.checkedIn,
        status: k.status,
        notes: k.notes || null
      };
      const { error } = await supabase.from('kit_items').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving kit item to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save 3-day cycle report
  async saveCycleReport(cr: Cycle3DayReport): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: cr.id,
        client_id: cr.clientId,
        client_name: cr.clientName,
        period_start: cr.periodStart,
        period_end: cr.periodEnd,
        cycle_number: cr.cycleNumber,
        generated_date: cr.generatedDate,
        status: cr.status,
        items: cr.items
      };
      const { error } = await supabase.from('cycle_reports').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving cycle report to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Save supply request
  async saveSupplyRequest(sr: SupplyRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = {
        id: sr.id,
        client_id: sr.clientId,
        client_name: sr.clientName,
        request_date: sr.requestDate,
        cycle_report_id: sr.cycleReportId || null,
        status: sr.status,
        items: sr.items,
        notes: sr.notes || null,
        total_estimated_cost: sr.totalEstimatedCost
      };
      const { error } = await supabase.from('supply_requests').upsert(payload);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error saving supply request to Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Delete supply request
  async deleteSupplyRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('supply_requests').delete().eq('id', requestId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting supply request from Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Purge legacy sample mock data from Supabase tables (Only called manually)
  async purgeMockDataFromDatabase(): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete only known demo companies
      await supabase.from('clients').delete().in('name', ['SkyTower Corporativo', 'Clínica Dental Sonrisas', 'Gimnasio FitZone 24/7', 'Residencial Los Álamos']);
      await supabase.from('employees').delete().in('username', ['carlos.mendoza', 'lucia.santos', 'miguel.rivas']);
      await supabase.from('app_users').delete().in('username', ['carlos.mendoza', 'lucia.santos', 'miguel.rivas', 'cliente.skytower']);
      return { success: true };
    } catch (err: any) {
      console.error('Error purging mock data from Supabase:', err);
      return { success: false, error: err.message };
    }
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
