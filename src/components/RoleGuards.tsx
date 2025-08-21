/**
 * Role-based access control components
 * Provides reusable components for conditional rendering based on user roles
 */

import React from 'react';
import { isCareerAssociate, isNonCareerAssociate, roleAccess } from '../utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ConditionalRenderProps {
  children: React.ReactNode;
  condition: boolean;
  fallback?: React.ReactNode;
}

/**
 * Conditional rendering component for cleaner role-based logic
 */
const ConditionalRender: React.FC<ConditionalRenderProps> = ({ 
  children, 
  condition, 
  fallback = null 
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

/**
 * Renders content only for career associates
 */
export const CareerAssociateOnly: React.FC<RoleGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <ConditionalRender condition={isCareerAssociate()} fallback={fallback}>
      {children}
    </ConditionalRender>
  );
};

/**
 * Renders content only for non-career associates
 */
export const NonCareerAssociateOnly: React.FC<RoleGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <ConditionalRender condition={isNonCareerAssociate()} fallback={fallback}>
      {children}
    </ConditionalRender>
  );
};

/**
 * Renders content for all authenticated users
 */
export const AuthenticatedOnly: React.FC<RoleGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  return (
    <ConditionalRender condition={true} fallback={fallback}>
      {children}
    </ConditionalRender>
  );
};

/**
 * Feature-specific guards using roleAccess configuration
 */
export const FeatureGuard: React.FC<{
  feature: keyof typeof roleAccess;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ feature, children, fallback = null }) => {
  const hasAccess = Object.values(roleAccess[feature]).some(check => check());
  
  return (
    <ConditionalRender condition={hasAccess} fallback={fallback}>
      {children}
    </ConditionalRender>
  );
};

export default {
  CareerAssociateOnly,
  NonCareerAssociateOnly,
  AuthenticatedOnly,
  FeatureGuard,
};