'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { User, AuditLogEntry } from '@/lib/types';
import { getAuditLog } from '@/lib/services/audit.service';
import { getUsers } from '@/lib/services/users.service';
import { useEffect, useState } from 'react';

export function AuditLog() {
  const [log, setLog] = useState<AuditLogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [auditLogData, usersData] = await Promise.all([getAuditLog(), getUsers()]);
        setLog(auditLogData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch audit log or users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getActionBadgeVariant = (action: string) => {
      switch (action) {
          case 'UPLOAD': return 'default';
          case 'REASSIGN': return 'secondary';
          case 'UPDATE_STATUS': return 'outline';
          case 'ADD_USER': return 'default';
          case 'DOWNLOAD_REPORT': return 'secondary';
          default: return 'outline';
      }
  }

  if (loading) {
    return <div>Loading audit log...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Audit Log</h3>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {log.map((logEntry) => {
              const user = users.find((u) => u.id === logEntry.userId);
              return (
                <TableRow key={logEntry.id}>
                  <TableCell>
                    {user && (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(logEntry.action)}>{logEntry.action}</Badge>
                  </TableCell>
                  <TableCell>{logEntry.details}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(logEntry.timestamp), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
