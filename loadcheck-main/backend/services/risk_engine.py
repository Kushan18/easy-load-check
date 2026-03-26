from ..models.enums import RiskColor

class RiskEngine:
    @staticmethod
    def calculate_risk(weight: float, capacity: float):
        """
        Deterministic Risk Logic:
        - weight < 80% capacity -> GREEN
        - 80% <= weight <= 100% -> YELLOW
        - weight > 100% -> RED
        """
        if capacity <= 0:
            return RiskColor.RED, 999.0
        
        utilization = weight / capacity
        
        if utilization < 0.8:
            return RiskColor.GREEN, utilization
        elif utilization <= 1.0:
            return RiskColor.YELLOW, utilization
        else:
            return RiskColor.RED, utilization
