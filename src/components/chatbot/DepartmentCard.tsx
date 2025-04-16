
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ServiceList } from './ServiceList';
import { Department } from '@/types';

interface DepartmentCardProps {
  department: Department;
  expanded: boolean;
  onToggleExpand: () => void;
  onDeleteDepartment: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  expanded,
  onToggleExpand,
  onDeleteDepartment
}) => {
  return (
    <Card className="border">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={onToggleExpand}>
            {expanded ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            <h3 className="text-lg font-medium">{department.name}</h3>
          </div>
          <Button variant="ghost" onClick={onDeleteDepartment}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        {department.description && <p className="text-sm text-muted-foreground">{department.description}</p>}
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <ServiceList departmentId={department.id} />
        </CardContent>
      )}
    </Card>
  );
};
