const DashboardHeader = ({
  containerClassName,
  titleClassName,
  title,
  subtitle,
  user,
  iconSrc,
  iconAlt,
  lastLoginLabel,
  showEmail = false,
  children,
}) => {
  return (
    <div className={`${containerClassName} flex flex-col items-start rounded-[10px] p-4 md:p-8 mb-6 text-left md:text-left md:flex-col md:items-center md:justify-center md:text-center`}>
      <div>
        <h1 className={`text-[20px] font-bold mb-0 md:text-[28px] ${titleClassName}`}>
          {title}
        </h1>
        <p className="text-white text-[9px] mt-2 md:text-[13px]">{subtitle}</p>
      </div>
      <div className="bg-[#FFFFFF]/20 rounded-[10px] w-[282px] md:w-[350px] h-[57px] md:h-[120px] p-[9px] md:p-4 mt-4 text-left flex flex-row md:flex-col justify-center md:justify-center md:items-center md:mx-auto">
        <div className="flex flex-row md:flex-col gap-[10px] md:gap-[2px] items-center w-full h-full justify-center md:justify-center">
          <img src={iconSrc} alt={iconAlt} className="mx-auto md:mx-auto" />
          <div className="flex flex-col items-start text-left w-full md:justify-center md:h-full md:items-center">
            {user && (
              <>
                <p className="text-white text-[12px] font-regular md:text-[15px] text-left md:text-center md:items-center">
                  {user.firstName} {user.lastName}
                </p>
                {showEmail && (
                  <p className="text-white text-[12px] md:text-[13px] text-left md:text-center">
                    {user.email}
                  </p>
                )}
                {children}
              </>
            )}
            <p className="text-white text-[12px] md:text-[13px] text-left md:text-center">
              {lastLoginLabel} {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;